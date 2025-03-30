from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
from DocgeneratorBRDSRS import MultiMediaProcessor
import tempfile
from pathlib import Path
import subprocess
import datetime

docgeneratorbrdsrs_bp = Blueprint('docgeneratorbrdsrs', __name__)

# Initialize the processor
processor = MultiMediaProcessor()

# Temporary directory for file uploads
UPLOAD_FOLDER = tempfile.mkdtemp()
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'xls', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_fpdf_installed():
    try:
        import fpdf
    except ImportError:
        print("Installing FPDF...")
        subprocess.check_call(["pip", "install", "fpdf"])
        print("FPDF installed successfully!")

def generate_simple_pdf(content, output_path):
    """Generate a simple PDF using FPDF."""
    from fpdf import FPDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', '', 12)
    
    # Split content into lines and write to PDF
    lines = content.split('\n')
    for line in lines:
        if line.strip():
            # Handle headers (lines starting with #)
            if line.strip().startswith('#'):
                pdf.set_font('Arial', 'B', 14)
                pdf.multi_cell(0, 10, line.strip('#').strip())
                pdf.set_font('Arial', '', 12)
            else:
                pdf.multi_cell(0, 5, line)
        else:
            pdf.ln(5)
    
    pdf.output(output_path)

@docgeneratorbrdsrs_bp.route('/process', methods=['POST'])
def process_documents():
    if 'files' not in request.files:
        return jsonify({'success': False, 'message': 'No files provided'}), 400

    files = request.files.getlist('files')
    if not files:
        return jsonify({'success': False, 'message': 'No files selected'}), 400

    document_type = request.form.get('document_type')
    if not document_type or document_type not in ['BRD', 'SRS']:
        return jsonify({'success': False, 'message': 'Invalid document type'}), 400

    business_domain = request.form.get('business_domain')

    # Save uploaded files temporarily
    file_paths = []
    try:
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                file_paths.append(filepath)
            else:
                return jsonify({'success': False, 'message': f'Invalid file type: {file.filename}'}), 400

        # Generate document
        generated_docs = processor.process_multiple_documents(
            document_type=document_type,
            source_files=file_paths,
            business_domain=business_domain
        )

        # Save generated documents
        output_dir = os.path.join(UPLOAD_FOLDER, 'generated')
        os.makedirs(output_dir, exist_ok=True)
        processor.save_documents(generated_docs, output_dir)

        # Get the first document (since we're generating only one)
        doc_name = list(generated_docs.keys())[0]
        
        # Prepare URLs for different formats
        base_url = f'http://localhost:5000/api/docgeneratorbrdsrs/download/{doc_name}'
        document_urls = {
            'pdfUrl': f'{base_url}.pdf',
            'markdownUrl': f'{base_url}.md',
            'textUrl': f'{base_url}.txt',
            'previewUrl': f'{base_url}/preview',
            'content': generated_docs[doc_name]  # Include the content for editing
        }

        return jsonify({
            'success': True,
            'document': document_urls
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

    finally:
        # Clean up uploaded files
        for filepath in file_paths:
            try:
                os.remove(filepath)
            except:
                pass

@docgeneratorbrdsrs_bp.route('/edit', methods=['POST'])
def edit_document():
    try:
        data = request.json
        content = data.get('content', '').strip()
        edit_instructions = data.get('additional_context', '').strip()
        document_type = data.get('document_type', 'BRD')
        edit_type = data.get('edit_type', 'modify')

        if not content:
            return jsonify({
                'success': False,
                'message': 'No content provided. Please ensure the document content is not empty.'
            }), 400

        # If there are no AI instructions, just use the content as is
        if not edit_instructions:
            updated_content = content  # Use manual edits
        else:
            try:
                # Store the content as a temporary file for processing
                temp_dir = os.path.join(UPLOAD_FOLDER, 'temp')
                os.makedirs(temp_dir, exist_ok=True)
                temp_file = os.path.join(temp_dir, f'temp_edit_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.md')
                
                with open(temp_file, 'w', encoding='utf-8') as f:
                    f.write(content)

                # Process the document with the editing instructions
                generated_docs = processor.process_multiple_documents(
                    document_type=document_type,
                    source_files=[temp_file],
                    business_domain=edit_instructions
                )

                if not generated_docs:
                    print("AI generation returned no content, using original content")
                    updated_content = content
                else:
                    # Get the generated content
                    updated_content = list(generated_docs.values())[0]

                    # If we're removing a section and the content hasn't changed substantially
                    if "remove" in edit_instructions.lower() and updated_content.strip() == content.strip():
                        print("AI didn't remove section, attempting manual removal...")
                        # Try to manually remove the section
                        lines = content.split('\n')
                        updated_lines = []
                        skip_section = False
                        
                        for i, line in enumerate(lines):
                            # Check for section headers
                            if line.strip().lower().startswith('# executive summary') or line.strip().lower().startswith('#executive summary'):
                                skip_section = True
                                continue
                            # Check for next section header to stop skipping
                            elif skip_section and line.strip().startswith('#'):
                                skip_section = False
                            
                            if not skip_section:
                                updated_lines.append(line)
                        
                        updated_content = '\n'.join(updated_lines)
                        print("Manual section removal completed")

                # Clean up temp file
                try:
                    os.remove(temp_file)
                except:
                    pass

            except Exception as e:
                print(f"AI-assisted edit error: {str(e)}")
                updated_content = content

        # Get or create document name
        if processor.document_name and '_with_references' in processor.document_name:
            # Use existing document name without the suffix
            doc_name = processor.document_name.replace('_with_references', '')
        else:
            # Create new document name
            doc_name = f"{document_type}_{datetime.datetime.now().strftime('%Y%m%d')}"

        # Add the suffix for saving files
        file_doc_name = f"{doc_name}_with_references"

        output_dir = os.path.join(UPLOAD_FOLDER, 'generated')
        os.makedirs(output_dir, exist_ok=True)

        # Save the content directly to files
        md_file_path = os.path.join(output_dir, f'{file_doc_name}.md')
        txt_file_path = os.path.join(output_dir, f'{file_doc_name}.txt')
        pdf_file_path = os.path.join(output_dir, f'{file_doc_name}.pdf')
        
        # Save markdown version
        with open(md_file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        # Save text version
        with open(txt_file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)

        # Generate PDF
        try:
            ensure_fpdf_installed()
            generate_simple_pdf(updated_content, pdf_file_path)
        except Exception as pdf_error:
            print(f"Warning: PDF generation failed: {pdf_error}")
            # Continue without PDF, as it's not critical

        # Update processor's document name to maintain state
        processor.document_name = file_doc_name

        # Prepare URLs for different formats
        base_url = f'http://localhost:5000/api/docgeneratorbrdsrs/download/{doc_name}'
        document_urls = {
            'pdfUrl': f'{base_url}.pdf',
            'markdownUrl': f'{base_url}.md',
            'textUrl': f'{base_url}.txt',
            'previewUrl': f'{base_url}/preview',
            'content': updated_content
        }

        return jsonify({
            'success': True,
            'document': document_urls
        })

    except Exception as e:
        print(f"Edit document error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error processing edit request: {str(e)}'
        }), 500

@docgeneratorbrdsrs_bp.route('/regenerate', methods=['POST'])
def regenerate_document():
    try:
        data = request.json
        document_type = data.get('document_type')
        business_domain = data.get('business_domain')

        if not document_type:
            return jsonify({
                'success': False,
                'message': 'Document type is required for regeneration'
            }), 400

        if not processor.original_source_content:
            return jsonify({
                'success': False,
                'message': 'No source content available for regeneration'
            }), 400

        # Regenerate document from original sources
        generated_docs = processor.process_multiple_documents(
            document_type=document_type,
            source_files=processor.original_source_names,
            business_domain=business_domain
        )

        if not generated_docs:
            return jsonify({
                'success': False,
                'message': 'Failed to regenerate document from sources'
            }), 500

        # Save regenerated documents
        output_dir = os.path.join(UPLOAD_FOLDER, 'generated')
        os.makedirs(output_dir, exist_ok=True)
        processor.save_documents(generated_docs, output_dir)

        # Get the document name
        doc_name = list(generated_docs.keys())[0]

        # Prepare URLs for different formats
        base_url = f'http://localhost:5000/api/docgeneratorbrdsrs/download/{doc_name}'
        document_urls = {
            'pdfUrl': f'{base_url}.pdf',
            'markdownUrl': f'{base_url}.md',
            'textUrl': f'{base_url}.txt',
            'previewUrl': f'{base_url}/preview',
            'content': generated_docs[doc_name]
        }

        return jsonify({
            'success': True,
            'document': document_urls
        })

    except Exception as e:
        print(f"Regenerate document error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error regenerating document: {str(e)}'
        }), 500

@docgeneratorbrdsrs_bp.route('/download/<doc_name>.<format>', methods=['GET'])
def download_document(doc_name, format):
    try:
        output_dir = os.path.join(UPLOAD_FOLDER, 'generated')
        os.makedirs(output_dir, exist_ok=True)

        # Add _with_references suffix if not present
        if not doc_name.endswith('_with_references'):
            file_doc_name = f"{doc_name}_with_references"
        else:
            file_doc_name = doc_name

        if format == 'pdf':
            ensure_fpdf_installed()
            
            # First, read the markdown content
            md_file_path = os.path.join(output_dir, f'{file_doc_name}.md')
            if not os.path.exists(md_file_path):
                return jsonify({'success': False, 'message': 'Source markdown file not found'}), 404
            
            with open(md_file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Generate PDF
            pdf_file_path = os.path.join(output_dir, f'{file_doc_name}.pdf')
            try:
                generate_simple_pdf(content, pdf_file_path)
            except Exception as pdf_error:
                print(f"Error generating PDF: {pdf_error}")
                return jsonify({'success': False, 'message': 'Error generating PDF'}), 500
            
            return send_file(pdf_file_path, mimetype='application/pdf', as_attachment=True)
            
        elif format == 'md':
            file_path = os.path.join(output_dir, f'{file_doc_name}.md')
            if not os.path.exists(file_path):
                return jsonify({'success': False, 'message': 'Markdown file not found'}), 404
            return send_file(file_path, mimetype='text/markdown', as_attachment=True)
            
        elif format == 'txt':
            file_path = os.path.join(output_dir, f'{file_doc_name}.txt')
            if not os.path.exists(file_path):
                return jsonify({'success': False, 'message': 'Text file not found'}), 404
            return send_file(file_path, mimetype='text/plain', as_attachment=True)
            
        else:
            return jsonify({'success': False, 'message': 'Invalid format'}), 400

    except Exception as e:
        print(f"Error in download_document: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@docgeneratorbrdsrs_bp.route('/download/<doc_name>/preview', methods=['GET'])
def preview_document(doc_name):
    try:
        output_dir = os.path.join(UPLOAD_FOLDER, 'generated')
        
        # Add _with_references suffix if not present
        if not doc_name.endswith('_with_references'):
            file_doc_name = f"{doc_name}_with_references"
        else:
            file_doc_name = doc_name
            
        file_path = os.path.join(output_dir, f'{file_doc_name}.md')
        
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'message': 'Preview file not found'}), 404
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        return jsonify({
            'success': True,
            'content': content
        })

    except Exception as e:
        print(f"Error in preview_document: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500 