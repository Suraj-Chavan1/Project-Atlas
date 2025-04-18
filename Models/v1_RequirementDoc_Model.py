import os
import re  # Add import for regex
from openai import AzureOpenAI
import httpx
from datetime import datetime
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

# Template definitions
SDE_TEMPLATE = """SDE Team – SRS Input Template
1. Technical Feasibility Notes
- Preliminary assessment of features
- Potential technical blockers
- Preferred tech stack (if applicable)
2. Functional Requirements (Detailed)
- Endpoint definitions (if discussed)
- Data processing expectations
- System behavior notes
3. Non-Functional Requirements (NFRs)
- Performance expectations
- Scalability considerations
- Code maintainability
4. Data Models & Inputs
- Input/output formats
- Data constraints
- Entity relationships (if any)
5. Integration Points
- External system/API mentions
- Anticipated modules/services to interface with"""

DEVOPS_TEMPLATE = """DevOps Team – Devops Input Template
1. Deployment Requirements
- Target environments
- CI/CD pipeline expectations
- Infrastructure notes
2. Operational NFRs
- Uptime/availability goals
- Monitoring/logging needs
- Incident response strategies
3. Scalability & Load
- Load expectations
- Auto-scaling triggers
- Stress testing metrics
4. Security & Compliance
- Secrets & access control
- Data residency/compliance requirements
5. Dependencies & Versioning
- Tooling dependencies
- Environment-specific configurations"""

BA_TEMPLATE = """Business Analysts – Business Analysts Input Template
1. Stakeholder Needs and Objectives
- Summary of stakeholder goals
- Key business drivers
- Regulatory and compliance needs
2. Business Process Overview
- Existing workflow
- Proposed workflow changes
- Business constraints and rules
3. Functional Requirements (High-level)
- Core use cases identified
- Major system interactions
- Preliminary feature list
4. Success Criteria & KPIs
- Metrics for successful implementation
- Stakeholder-defined acceptance criteria
5. Dependencies and Assumptions
- Business-level dependencies
- Market or seasonal constraints"""

def generate_checklist_table(data: dict, normal_style: ParagraphStyle, key_style: ParagraphStyle, width: float) -> Table:
    """Generate a checklist table for the PDF."""
    table_data = []
    for key, value in data.items():
        key_paragraph = Paragraph(f"<b>{key}</b>", key_style)
        value_paragraph = Paragraph(value, normal_style)
        table_data.append([key_paragraph, value_paragraph])

    table = Table(table_data, colWidths=[width * 0.3, width * 0.7])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    return table

def generate_pdf(data: dict, output_path: str):
    """Generate a professional and visually appealing PDF document."""
    # Get template type from output path
    template_type = "Software Requirements"
    if "SDE_" in output_path:
        template_type = "SDE Requirements"
    elif "DevOps_" in output_path:
        template_type = "DevOps Requirements"
    elif "BA_" in output_path:
        template_type = "Business Analysis Requirements"
    
    # Set up the document with proper margins
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=60,
        leftMargin=60,
        topMargin=60,
        bottomMargin=60
    )
    
    # Define enhanced styles
    styles = getSampleStyleSheet()
    
    # Professional title style
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=24,
        alignment=1,  # Center alignment
        spaceAfter=16,
        textColor=colors.HexColor('#1B365D')  # Dark blue
    )
    
    # Modern subtitle style
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor('#2E5C8A'),  # Medium blue
        spaceBefore=14,
        spaceAfter=8,
        alignment=0,  # Left alignment
        borderWidth=0
    )
    
    # Section header style
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=colors.HexColor('#4A4A4A'),  # Dark gray
        spaceBefore=12,
        spaceAfter=6,
        leftIndent=0
    )
    
    # Clean normal text style
    normal_style = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#333333')  # Soft black
    )
    
    # Build document content
    content = []
    
    # Header section
    timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    
    content.append(Paragraph(template_type + " Specification", title_style))
    content.append(Spacer(1, 10))
    content.append(Paragraph(f"Generated on: {timestamp}", ParagraphStyle(
        'Timestamp', 
        parent=normal_style,
        textColor=colors.HexColor('#666666'),  # Medium gray
        alignment=1  # Center aligned
    )))
    content.append(Spacer(1, 30))
    
    # Process each section
    for section, section_content in data.items():
        # Add section header
        content.append(Paragraph(section, subtitle_style))
        
        # Add horizontal rule
        hr_table = Table([['']],colWidths=[doc.width-20],rowHeights=[1])
        hr_table.setStyle(TableStyle([
            ('LINEABOVE', (0,0), (-1,0), 1, colors.HexColor('#DDDDDD')),  # Light gray line
        ]))
        content.append(hr_table)
        content.append(Spacer(1, 10))
        
        # Format and add section content
        if isinstance(section_content, dict):
            # Handle nested dictionary content
            for subsection, subsection_content in section_content.items():
                if subsection != 'content':  # Skip the 'content' key used for metadata
                    content.append(Paragraph(subsection, section_style))
                    content.append(Spacer(1, 6))
                    
                    # Break content into paragraphs for better flow
                    paragraphs = str(subsection_content).split('\n')
                    for para in paragraphs:
                        if para.strip():
                            content.append(Paragraph(para.strip(), normal_style))
                            content.append(Spacer(1, 4))
                    content.append(Spacer(1, 10))
        else:
            # Break content into paragraphs for better flow
            formatted_content = str(section_content).replace('•', '⚫')  # Replace bullet points with circles
            paragraphs = formatted_content.split('\n')
            
            for para in paragraphs:
                if para.strip():
                    if para.startswith('⚫'):
                        # Add bullet points with proper indentation
                        content.append(Paragraph(para, ParagraphStyle(
                            'BulletPoint',
                            parent=normal_style,
                            leftIndent=20,
                            firstLineIndent=0
                        )))
                    else:
                        content.append(Paragraph(para, normal_style))
                    content.append(Spacer(1, 4))
            
        content.append(Spacer(1, 20))
    
    # Add footer with page numbers
    def add_page_number(canvas, doc):
        page_num = canvas.getPageNumber()
        canvas.saveState()
        canvas.setFont("Helvetica", 9)
        canvas.setFillColor(colors.HexColor('#666666'))
        
        # Add header line
        canvas.setStrokeColor(colors.HexColor('#DDDDDD'))
        canvas.line(doc.leftMargin, doc.pagesize[1] - 40, doc.width + doc.rightMargin, doc.pagesize[1] - 40)
        
        # Add footer line
        canvas.line(doc.leftMargin, 50, doc.width + doc.rightMargin, 50)
        
        # Add page number
        canvas.drawRightString(doc.width + doc.rightMargin, 30, f"Page {page_num}")
        
        # Add document title in footer with correct template type
        canvas.drawString(doc.leftMargin, 30, f"{template_type} Specification")
        canvas.restoreState()
    
    # Build the PDF with page numbers and headers/footers
    try:
        doc.build(content, onFirstPage=add_page_number, onLaterPages=add_page_number)
        return True
    except Exception as e:
        print(f"Error building PDF: {str(e)}")
        # Attempt to build with emergency line breaks
        try:
            emergency_content = []
            for item in content:
                if isinstance(item, Paragraph):
                    # Force shorter paragraphs
                    text = item.text
                    style = item.style
                    chunks = [text[i:i+1000] for i in range(0, len(text), 1000)]
                    for chunk in chunks:
                        emergency_content.append(Paragraph(chunk, style))
                        emergency_content.append(Spacer(1, 4))
                else:
                    emergency_content.append(item)
            doc.build(emergency_content, onFirstPage=add_page_number, onLaterPages=add_page_number)
            return True
        except Exception as e2:
            print(f"Emergency PDF build failed: {str(e2)}")
            return False

class FormRecognizerExtractor:
    def __init__(self, endpoint, api_key):
        """Initialize the Form Recognizer client with Azure credentials."""
        if not endpoint or not api_key:
            raise ValueError("Both endpoint and API key are required")
            
        self.endpoint = endpoint
        self.api_key = api_key
        try:
            self.document_analysis_client = DocumentAnalysisClient(
                endpoint=self.endpoint,
                credential=AzureKeyCredential(self.api_key)
            )
        except Exception as e:
            raise Exception(f"Failed to initialize Form Recognizer client: {str(e)}")

    def extract_text_from_file(self, file_path):
        """Extract text from a document file."""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")

            print(f"Analyzing document: {file_path}")

            with open(file_path, "rb") as document:
                poller = self.document_analysis_client.begin_analyze_document(
                    "prebuilt-document", document
                )
                result = poller.result()

            text_content = []
            for paragraph in getattr(result, "paragraphs", []):
                text_content.append(paragraph.content)

            return "\n".join(text_content)

        except Exception as e:
            print(f"Error extracting text from document: {str(e)}")
            return None

    def is_url(self, input_string):
        """Check if the input string is a URL."""
        return input_string.startswith("http://") or input_string.startswith("https://")

    def extract_text_from_url(self, url):
        """Extract text from a document URL."""
        try:
            response = httpx.get(url)
            response.raise_for_status()
            with open("temp_document", "wb") as temp_file:
                temp_file.write(response.content)
            return self.extract_text_from_file("temp_document")
        except Exception as e:
            print(f"Error extracting text from URL: {str(e)}")
            return None

class User:
    def __init__(self, user_id, name):
        self.user_id = user_id
        self.name = name
        self.requirements = []
        self.generated_templates = set()
        self.timestamp = datetime.now()
        self.reference_counter = 1

    def add_requirement_from_source(self, text, source_type="text", reference=None):
        """Add a requirement with source information"""
        if reference:
            ref_number = self.reference_counter
            self.reference_counter += 1
        else:
            ref_number = None

        self.requirements.append({
            "text": text,
            "timestamp": datetime.now(),
            "source": source_type,
            "reference": reference,
            "ref_number": ref_number
        })

    def clear_requirements(self):
        """Clear all requirements"""
        self.requirements = []
        self.reference_counter = 1

    def get_all_requirements(self):
        """Get all requirements as a single string"""
        return '\n'.join(req['text'] for req in self.requirements)

    def has_generated_template(self, template_type):
        """Check if a specific template type has been generated"""
        return template_type in self.generated_templates

    def mark_template_generated(self, template_type):
        """Mark a template type as generated"""
        self.generated_templates.add(template_type)

def process_input(user, generator, is_append=False):
    """Unified input processor that automatically detects input type"""
    if is_append:
        print(f"\nAppending requirements for user: {user.name}")
    else:
        print(f"\nEntering requirements for user: {user.name}")
    
    print("Enter your requirements (text, file paths, or URLs)")
    print("To add a reference, use format: [ref: your_reference] on a new line")
    print("Type 'freeze' on a new line when done")
    
    # Initialize document extractor
    doc_extractor = FormRecognizerExtractor(
        endpoint="https://barclaysform.cognitiveservices.azure.com/",
        api_key="63spGg0VYFV0kWZB3nmsFDp8yEbi40zmEnCvIl6D8Seih4YyLsp9JQQJ99BDACYeBjFXJ3w3AAALACOGh5hu"
    )
    current_text = ""
    current_reference = ""

    while True:
        line = input().strip()
        
        if line.lower() == 'freeze':
            # Add any remaining text with reference
            if current_text:
                # Generate summary for text input if it's long enough
                if len(current_text.split()) > 100:  # Summarize if more than 100 words
                    summary = generator.generate_summary(current_text, is_long_document=False)
                    print("\nSummary of text input:")
                    print(summary)
                
                user.add_requirement_from_source(current_text.strip(), "text", current_reference)
            break

        # Check if line is a reference
        if line.startswith('[ref:'):
            if current_text:  # Save previous text if exists
                user.add_requirement_from_source(current_text.strip(), "text", current_reference)
                current_text = ""
            current_reference = line[5:].strip().rstrip(']')
            continue

        # Check if input is a URL
        if doc_extractor.is_url(line):
            # Save any previous text
            if current_text:
                user.add_requirement_from_source(current_text.strip(), "text", current_reference)
                current_text = ""
                current_reference = ""

            print(f"Processing document from URL: {line}")
            text = doc_extractor.extract_text_from_url(line)
            if text:
                # Generate summary for URL document
                summary = generator.generate_summary(text, is_long_document=True)
                print("\nDocument Summary:")
                print(summary)
                
                user.add_requirement_from_source(text, "document (URL)", line)
                print("Document processed successfully")
            else:
                print("Failed to process document URL")
            continue

        # Check if input is a file path
        if os.path.exists(line):
            # Save any previous text
            if current_text:
                user.add_requirement_from_source(current_text.strip(), "text", current_reference)
                current_text = ""
                current_reference = ""

            print(f"Processing document: {line}")
            text = doc_extractor.extract_text_from_file(line)
            if text:
                # Generate summary for file document
                summary = generator.generate_summary(text, is_long_document=True)
                print("\nDocument Summary:")
                print(summary)
                
                user.add_requirement_from_source(text, "document (file)", line)
                print("Document processed successfully")
            else:
                print("Failed to process document")
            continue

        # Regular text input
        current_text += line + "\n"

def display_template_menu(user):
    """Display available template options"""
    print("\nAvailable Templates:")
    print("1. SDE Template" + (" (Generated)" if user.has_generated_template("1") else ""))
    print("2. DevOps Template" + (" (Generated)" if user.has_generated_template("2") else ""))
    print("3. Business Analyst Template" + (" (Generated)" if user.has_generated_template("3") else ""))
    print("4. Generate All Templates")
    print("5. Back to Main Menu")

def display_menu():
    """Display the main menu options"""
    print("\nRequirements Generator Menu:")
    print("1. Add New User")
    print("2. Select User")
    print("3. Enter/Append Requirements")
    print("4. Generate Requirements Document")
    print("5. View Current Requirements")
    print("6. Clear Requirements")
    print("7. List All Users")
    print("8. Exit")

class RequirementsGenerator:
    def __init__(self):
        self.endpoint = "https://suraj-m9lgdbv9-eastus2.cognitiveservices.azure.com/"
        self.deployment = "gpt-4o"
        self.api_key = "75PVa3SAy9S2ZR590gZesyTNDMZtb3Oa5EdHlRbqWeQ89bmoOGl4JQQJ99BDACHYHv6XJ3w3AAAAACOGUP8d"
        self.api_version = "2024-12-01-preview"
        self.client = AzureOpenAI(
            azure_endpoint=self.endpoint,
            api_key=self.api_key,
            api_version=self.api_version,
            http_client=httpx.Client()
        )
        self.users = {}

    def generate_summary(self, text, is_long_document=False):
        """Generate a summary of the input text, adjusting length based on document size"""
        try:
            # Prepare prompt based on document length
            if is_long_document:
                prompt = "Please provide a detailed multi-paragraph summary of the following document, capturing all key points and main ideas:"
            else:
                prompt = "Please provide a concise 2-3 sentence summary of the following text:"

            response = self.client.chat.completions.create(
                model=self.deployment,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": text}
                ],
                max_tokens=1000 if is_long_document else 300,
                temperature=0.5
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            return "Failed to generate summary."

    def add_user(self, user_id, name):
        """Add a new user"""
        if user_id in self.users:
            return False
        self.users[user_id] = User(user_id, name)
        return True

    def get_user(self, user_id):
        """Retrieve a user by ID"""
        return self.users.get(user_id)

    def parse_generated_content(self, content):
        """Parse the generated content into structured sections based on template type"""
        sections = {}
        
        # Identify template type and set appropriate sections based on content markers
        if "Stakeholder Needs" in content or "Business Process Overview" in content:
            # Business Analyst Template
            sections = {
                'Stakeholder Needs and Objectives': '',
                'Business Process Overview': '',
                'Functional Requirements (High-level)': '',
                'Success Criteria & KPIs': '',
                'Dependencies and Assumptions': ''
            }
        elif "Technical Feasibility Notes" in content or "Data Models & Inputs" in content:
            # SDE Template
            sections = {
                'Technical Feasibility Notes': '',
                'Functional Requirements': '',
                'Non-Functional Requirements': '',
                'Data Models & Inputs': '',
                'Integration Points': ''
            }
        elif "Deployment Requirements" in content or "Operational NFRs" in content:
            # DevOps Template
            sections = {
                'Deployment Requirements': '',
                'Operational NFRs': '',
                'Scalability & Load': '',
                'Security & Compliance': '',
                'Dependencies & Versioning': ''
            }
        else:
            # Default to BA Template if template type can't be determined
            sections = {
                'Stakeholder Needs and Objectives': '',
                'Business Process Overview': '',
                'Functional Requirements (High-level)': '',
                'Success Criteria & KPIs': '',
                'Dependencies and Assumptions': ''
            }

        current_section = None
        current_content = []
        lines = content.split('\n')
        
        # Process the content line by line
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
                
            # Check if this line is a section header
            is_section_header = False
            matched_section = None
            
            # First check for numbered sections and exact matches
            for section in sections.keys():
                if any([
                    line.lower() == section.lower(),
                    section.lower() in line.lower() and (line.startswith(section) or line.startswith(f"1. {section}") or line.startswith(f"2. {section}") or line.startswith(f"3. {section}") or line.startswith(f"4. {section}") or line.startswith(f"5. {section}")),
                    f". {section}" in line,
                    f".{section}" in line
                ]):
                    matched_section = section
                    is_section_header = True
                    break
            
            if is_section_header:
                # Save content of previous section if it exists
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                
                # Start new section
                current_section = matched_section
                current_content = []
                continue
            
            # If we have a current section, add content to it
            if current_section and line:
                # Skip any remaining header-like text or numbering
                if not (line.endswith(':') or line.startswith('#') or re.match(r'^\d+\.', line)):  # Fixed: Using re.match instead of string match
                    # Clean up bullet points for consistency
                    if line.startswith('- ') or line.startswith('* '):
                        line = '• ' + line[2:]
                    elif line.startswith('-') or line.startswith('*'):
                        line = '• ' + line[1:]
                    current_content.append(line)
        
        # Add any remaining content from the last section
        if current_section and current_content:
            sections[current_section] = '\n'.join(current_content).strip()
        
        # Clean up empty sections and format bullet points
        for section in sections:
            if not sections[section]:
                sections[section] = 'No information provided.'
                continue
                
            # Format bullet points consistently
            lines = sections[section].split('\n')
            formatted_lines = []
            for line in lines:
                line = line.strip()
                # Convert various bullet point styles to a consistent format
                if line.startswith('- ') or line.startswith('* '):
                    line = '• ' + line[2:]
                elif line.startswith('-') or line.startswith('*'):
                    line = '• ' + line[1:]
                formatted_lines.append(line)
            sections[section] = '\n'.join(formatted_lines)

        return sections

    def generate_pdf_for_requirements(self, user_id, template_choice, output_path):
        """Generate a PDF document for the requirements"""
        user = self.get_user(user_id)
        if not user:
            return False, "User not found"
            
        # Generate requirements based on template
        template_type = "SDE" if template_choice == "1" else "DevOps" if template_choice == "2" else "BA"
        try:
            # Generate content using OpenAI
            template = self.get_template_for_choice(template_choice)
            response = self.client.chat.completions.create(
                model=self.deployment,
                messages=[
                    {"role": "system", "content": f"Generate detailed requirements following this template:\n\n{template}"},
                    {"role": "user", "content": user.get_all_requirements()}
                ],
                max_tokens=2000,
                temperature=0.7,
                top_p=0.9
            )
            
            content = response.choices[0].message.content
            sections = self.parse_generated_content(content)
            
            # Generate an executive summary of the entire document
            summary = self.generate_summary(content, is_long_document=True)
            print("\nExecutive Summary of Generated Document:")
            print("-" * 50)
            print(summary)
            print("-" * 50)
            
            # Add summary to sections
            sections = {
                'Executive Summary': summary,
                **sections  # Add the rest of the sections after summary
            }
            
            # Generate PDF
            generate_pdf(sections, output_path)
            return True, "PDF generated successfully"
            
        except Exception as e:
            return False, f"Error generating requirements: {str(e)}"

    def get_template_for_choice(self, choice):
        """Get the appropriate template based on user choice"""
        if choice == "1":
            return SDE_TEMPLATE
        elif choice == "2":
            return DEVOPS_TEMPLATE
        else:
            return BA_TEMPLATE

if __name__ == "__main__":
    generator = RequirementsGenerator()
    current_user = None
    
    while True:
        display_menu()
        choice = input("\nEnter your choice (1-8): ")
        
        if choice == "1":
            user_id = input("Enter user ID: ")
            name = input("Enter user name: ")
            if generator.add_user(user_id, name):
                print(f"\nUser {name} added successfully!")
            else:
                print("\nUser ID already exists!")

        elif choice == "2":
            user_id = input("Enter user ID: ")
            user = generator.get_user(user_id)
            if user:
                current_user = user
                print(f"\nSwitched to user: {current_user.name}")
            else:
                print("\nUser not found!")

        elif choice == "3":  # Unified Input
            if current_user:
                is_append = False
                if current_user.requirements:
                    response = input("Do you want to append to existing requirements? (y/n): ").lower()
                    is_append = response.startswith('y')
                process_input(current_user, generator, is_append)
            else:
                print("\nPlease select a user first!")

        elif choice == "4":  # Generate Templates
            if current_user:
                if current_user.requirements:
                    while True:
                        display_template_menu(current_user)
                        template_choice = input("\nEnter your choice (1-5): ")
                        
                        if template_choice in ["1", "2", "3"]:
                            # Generate PDF filename based on template type and timestamp
                            template_type = 'SDE' if template_choice == '1' else 'DevOps' if template_choice == '2' else 'BA'
                            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                            pdf_filename = f"requirements_{template_type}_{timestamp}.pdf"
                            pdf_path = os.path.join(os.path.dirname(__file__), pdf_filename)
                            
                            # Generate requirements and PDF
                            success, message = generator.generate_pdf_for_requirements(
                                current_user.user_id, 
                                template_choice,
                                pdf_path
                            )
                            
                            if success:
                                current_user.mark_template_generated(template_choice)
                                print(f"\nGenerated PDF: {pdf_filename}")
                            else:
                                print(f"\nError: {message}")
                                
                        elif template_choice == "4":
                            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                            for temp_choice in ["1", "2", "3"]:
                                template_type = 'SDE' if temp_choice == '1' else 'DevOps' if temp_choice == '2' else 'BA'
                                pdf_filename = f"requirements_{template_type}_{timestamp}.pdf"
                                pdf_path = os.path.join(os.path.dirname(__file__), pdf_filename)
                                
                                print(f"\nGenerating {template_type} Template PDF...")
                                success, message = generator.generate_pdf_for_requirements(
                                    current_user.user_id,
                                    temp_choice,
                                    pdf_path
                                )
                                
                                if success:
                                    current_user.mark_template_generated(temp_choice)
                                    print(f"Generated PDF: {pdf_filename}")
                                else:
                                    print(f"Error: {message}")
                                print("="*50)
                                
                        elif template_choice == "5":
                            break
                        else:
                            print("\nInvalid choice. Please try again.")
                else:
                    print("\nNo requirements entered yet!")
            else:
                print("\nPlease select a user first!")

        elif choice == "5":  # View Requirements
            if current_user:
                print(f"\nCurrent requirements for {current_user.name}:")
                for i, req in enumerate(current_user.requirements, 1):
                    source = f" (Source: {req.get('source', 'text input')})"
                    ref = f" [Ref {req['ref_number']}]" if req.get('ref_number') else ""
                    print(f"{i}. {req['text']}{ref} (Added: {req['timestamp']}){source}")
                
                if any(req.get('ref_number') for req in current_user.requirements):
                    print("\nReferences:")
                    for req in current_user.requirements:
                        if req.get('ref_number'):
                            print(f"[{req['ref_number']}] {req['reference']}")
                
                if current_user.generated_templates:
                    print("\nGenerated Templates:")
                    for template in current_user.generated_templates:
                        print(f"- {'SDE' if template == '1' else 'DevOps' if template == '2' else 'Business Analyst'} Template")
            else:
                print("\nPlease select a user first!")

        elif choice == "6":  # Clear Requirements
            if current_user:
                current_user.clear_requirements()
                current_user.generated_templates.clear()
                print(f"\nRequirements cleared for {current_user.name}")
            else:
                print("\nPlease select a user first!")

        elif choice == "7":  # List Users
            if generator.users:
                print("\nRegistered Users:")
                for user_id, user in generator.users.items():
                    print(f"ID: {user_id}, Name: {user.name}")
            else:
                print("\nNo users registered yet!")

        elif choice == "8":  # Exit
            print("\nGoodbye!")
            break

        else:
            print("\nInvalid choice. Please try again.")
