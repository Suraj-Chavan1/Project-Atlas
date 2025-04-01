
## Problem statement chosen:
![image](https://github.com/user-attachments/assets/7ccf432c-c214-4141-9bd7-2e750374b226)


# 🏛️ Project ATLAS  🌐

![image](https://github.com/user-attachments/assets/539e9c60-50b0-4ee3-b786-b54bcefda38a)



## Introduction

In today's **fast-paced** software development landscape, traditional methods for **requirement gathering**, **documentation**, and **test case generation** are labor-intensive, error-prone, and time-consuming. At **Barclays**, where **precision** and **compliance** are critical, these challenges demand a transformative solution.

**Project ATLAS** automates the entire lifecycle of **software documentation** using advanced **Generative AI**. 

Moreover, **Project ATLAS** streamlines the extraction of **requirements** from both **textual** and **graphical inputs**, generates structured **SRS**/**BRD** or any types of requirement documents, and seamlessly integrates with **JIRA** for automated backlog updates and efficient **workflow management**.

## Objectives

- **Automate Requirement Extraction**  
  AI-driven analysis of documents and graphics to generate structured requirements, significantly reducing manual effort.

- **Streamline Documentation**  
  Automatically generate standardized SRS, SOW documents, and JIRA user stories to accelerate the documentation process based on user input, speeding up documentation process by **90 percent**.

- **Enhance Security**  
  Leverage MFA, and RBAC(Role based Access Control)  to ensure that all sensitive data remains secure and compliant.

- **Integrate with JIRA & Workplace Automation**  
  Seamlessly push updates to JIRA and automate workflow processes to ensure efficient backlog management.

- **Accelerate Testing**  
  AI-powered test case generation and code documentation reducing manual efforts by 70 percent.
  
- **Enable Multi-User Collaboration**  
  Supports scalable, concurrent usage with role-based access control and versioned document management where each team (sde/dev ops / analyst) can edit / version document based on client requirement on 1
  dashboard.

# USPs

The following are the Unique Selling Propositions Our Platform Offers

![image](https://github.com/user-attachments/assets/b6abc38f-4c13-4b28-926d-741c534c66d4)
## Impact
Project ATLAS delivers a robust, AI-powered solution that accelerates documentation, reduces manual intervention, and accelerates software development cycles. By ensuring data security and compliance through locally deployed models and secure cloud infrastructure, the platform significantly enhances operational efficiency and quality at Barclays.

# Market Analysis

![image](https://github.com/user-attachments/assets/e7869f52-7b7e-496f-bb13-ad77e7fb4389)

![image](https://github.com/user-attachments/assets/a57a8b13-d27d-4060-a9b3-e6383d56e3eb)

- The AI-driven requirement engineering market is rapidly growing with increased adoption of AI-powered documentation.
- Project Atlas combines the best features of both product niches while adding AI-powered requirement gathering capabilities.
- Large enterprises require automation due to compliance and efficiency demands.


# Methodology Details
## Architecture(Please do Zoom in or do go for the link for more details:
![barclays-Page-1 (1)](https://github.com/user-attachments/assets/50108823-388d-48fb-8d61-6e497898695d)


## User Flow

## Methodology

![Image](https://github.com/user-attachments/assets/94748ea5-e69f-4a8c-b7cd-45e829995c27)

## Design Considerations:

1. **Why Azure Functions?**  
We use Azure Functions for serverless, event-driven automation in our tool. This approach helps:
    - Handle document processing and user story generation
    - Provide real-time notifications and secure APIs
    - Ensure scalability and cost-efficiency
    - Integrate seamlessly with other Azure services

2. **Why Privately Hosted LLMs/LVMs?**  
Using Gemini/OpenAI APIs would risk exposing enterprise data to third-party companies. Project Atlas deals with sensitive data, so we use Ollama and Azure VMs to privately host open-source LLMs/LVMs like LLama (3B, 7B) and LLAVA 7B parameter models to handle document inputs appropriately.

3. **Why Use RAGs (Retrieval Augmented Generation)?**  
RAG systems help us quickly find and use only the most relevant information from a large database. By using Vector search with Cosmos DB and limiting the amount of data given to the language model, RAG systems create more accurate and useful outputs. 
This approach:
    - Improves context relevance
    - Reduces hallucinations in AI outputs
    - Enables more accurate requirement extraction
    - Maintains historical context for projects

4. **Why Internal and External Context?**  
Requirement Gathering needs data from within the company (Business Team, DevOps Team, etc.) as well as from external markets, social trends, newer regulations, study groups, clients, and service providers. Both sources need to be accounted for, so we maintain separate internal and external contexts for each project.

5. **Why and How Versioning with Blob Storage?**  
Project management involves drafting documents multiple times before approval. We use Azure Blob Storage for automatic version control. Documents are stored using Role-Based Access Control (RBAC), so only authorized employees can access the documents.

# Tech stack

![image](https://github.com/user-attachments/assets/7cb3e30f-1a3a-42e4-8e1e-bda50ef3085c)

### Frontend
- **React JS:** For building a dynamic and responsive user interface.
- **Tailwind CSS:** For a clean, modern, and customizable design.

### Backend
- **Flask & Python:** For developing RESTful APIs, handling backend logic, and integrating with Azure services and AI models.

### Cloud & Serverless
- **Azure Function Apps:** For event-driven, serverless automation that processes inputs and triggers workflows.
- **Azure Blob Storage:** For storing uploaded documents and large datasets with built-in versioning.
- **Azure Cosmos DB:** For scalable, low-latency storage and querying of structured data.

### Machine Learning & AI
- **LLAVA (Open Source Vision Model) & OLLAMA LLMs (Open Source Text Models)/ AZURE OPEN AI:** For processing diverse input types including text and images.

### Deployment & Containerization
- **Docker:** For containerizing applications to ensure consistency across development, testing, and production.
- **Azure VMs:** For hosting containerized services and scaling as required.

### Integration & Automation
- **Jira REST API:** For seamless integration with project management tools, enabling automated user story creation and backlog management.
- **Azure Logic Apps:** For automating workflows and integrating with external systems.

### Security
- **Azure Multi-Factor Authentication (MFA):** For secure user access.
- **Role-Based Access Control (RBAC):** For managing permissions and ensuring data security.
- **Industry-standard Encryption:** AES-256, TLS 1.2/1.3, RSA-2048, and SHA-256 to protect data in transit and at rest.


# Security Aspects:

![Image](https://github.com/user-attachments/assets/4515460a-ced0-4887-946b-516f62939105)

Security and data protection are paramount for Project ATLAS, especially when handling sensitive enterprise requirements and documentation. Our comprehensive security approach includes:
1. **Keep Data in the Enterprise** 
***[Local Open-Source LLMs deployed on Azure VMs]***
   - Deploying Ollama Local LLMs on Azure VMs (GPU/CPU) ensures that in-house data never leaves the corporate network
   - Provides processing power for document analysis while maintaining data sovereignty
   - Eliminates the risk of sending sensitive data to third-party API providers
     
2. **Need-to-Know Access Controls** 
***[MFA and RBAC (Role-Based Access Control)]***
   - Azure Multi-Factor Authentication (MFA) for secure logins
   - Role-Based Access Control (RBAC) to restrict access based on job functions
   - Conditional Access Policies to enforce security based on device, location, and risk factors
   - Least privilege principles ensure users only access what they need
   - Read-only/Write-only permissions based on roles and responsibilities
  
3. **Industry-Standard Encryption** 
***[Industry Level Data Encryption Standards]***
   - AES-256 for data encryption at rest
   - TLS 1.2/1.3 for secure communication between components
   - RSA-2048 for key exchange mechanisms
   - SHA-256 for hashing and data integrity verification
   - FIPS 140-2/3 compliance for regulated industries
  
# Scalability

![Image](https://github.com/user-attachments/assets/7a5c2142-3b5a-441a-a00a-59261e8e109f)

## Infrastructure Readiness

Azure's cloud services enable both horizontal and vertical scaling, ensuring Project ATLAS can handle increased user numbers and application volumes without compromising performance, specifically for features like requirement extraction, document generation, and test case creation.

**Horizontal Scaling:**  
- Add more resource instances using Azure Virtual Machine Scale Sets and Azure Functions based on demand, ensuring efficient processing of high-volume textual and graphical inputs.

**Vertical Scaling:**  
- Upgrade existing resources with flexible VM sizes and scale Azure Vector DB to support intensive data ingestion and real-time processing needs.

**Key Considerations for Scalability:**  
1. **Virtual Machine Scale Sets:** Automatically scale VM instances to support locally deployed LLMs (Ollama with LLaMA 3B/7B and LLAVA Vision Model) during high-demand processing.
2. **Azure Functions:** Scale out automatically to handle event-triggered tasks such as document parsing and data extraction.
3. **Azure Vector DB:** Dynamically scale for managing semantic embeddings and context indexing with low latency.
4. **Azure Blob Storage:** Handle massive volumes of unstructured data (e.g., SRS/SOW documents, test case files, multimedia inputs) with high durability.

# Implementation UI
![WhatsApp Image 2025-04-01 at 22 23 43_978416b0](https://github.com/user-attachments/assets/cd530a67-e2a6-4ed5-94fc-9bde1c2a2887)

![WhatsApp Image 2025-03-30 at 13 17 41_346ff8c4](https://github.com/user-attachments/assets/0c8b01bd-457c-43f1-9ce1-b3a09cf52ba4)

![WhatsApp Image 2025-03-29 at 22 20 51_2e5f02db](https://github.com/user-attachments/assets/fc90610b-31b6-4364-8546-a10bb6272ef8)
![image](https://github.com/user-attachments/assets/671638b3-534f-4959-ae6f-e3795b3a5e37)
<img width="959" alt="image" src="https://github.com/user-attachments/assets/aad91285-8912-47e1-a9f9-c952d0eef4b5" />

<img width="957" alt="image" src="https://github.com/user-attachments/assets/059ee060-03ad-4197-9861-706cc0d7005c" />

<img width="959" alt="image" src="https://github.com/user-attachments/assets/cfcf88d1-723d-45e4-94a6-d258b624724b" />


<img width="959" alt="image" src="https://github.com/user-attachments/assets/0eca0721-a533-40f5-b2bc-e36473781920" />

<img width="941" alt="image" src="https://github.com/user-attachments/assets/41e269bb-13be-44c6-90d1-9ddaef29acfa" />
<img width="959" alt="image" src="https://github.com/user-attachments/assets/9b7a7f8d-1ef3-411c-810d-5ac856ed4414" />
<img width="958" alt="image" src="https://github.com/user-attachments/assets/1c252be7-2dfe-4b05-ae48-a9e00617e587" />
<img width="959" alt="image" src="https://github.com/user-attachments/assets/a891a529-1358-4f80-8ae7-1ed8160ca18c" />




## Closing Remarks

Thank you very much for giving us an opportunity to show our idea. We have tried to show as much implementation and documentation as we can, and we really hope you like our idea.

We would love to work with Barclays on this project and would greatly appreciate any feedback from the judges!

[Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSeEYeO0i4gwhKAgsvP2TqNMkgJf6N86oUwLe16KCgaWIU-PBg/viewform)

~~Team Cyber Wardens
