
## Problem statement chosen:
![image](https://github.com/user-attachments/assets/7ccf432c-c214-4141-9bd7-2e750374b226)


# 🏛️ Project ATLAS  🌐


![image](https://github.com/user-attachments/assets/34993e11-f641-4c2a-ac79-094cb676c636)




## Introduction

In today's **fast-paced** software development landscape, traditional methods for **requirement gathering**, **documentation**, and **test case generation** are labor-intensive, error-prone, and time-consuming. At **Barclays**, where **precision** and **compliance** are critical, these challenges demand a transformative solution.

**Project ATLAS** automates the entire lifecycle of **software documentation** using advanced **Generative AI**. By harnessing privately deployed open-source **LLMs** specifically **Ollama with LLaMA 3B/7B** and the **LLAVA Vision Model** on **Azure VMs**, the system ensures that sensitive data remains secure within **Barclays' infrastructure**. 

Moreover, **Project ATLAS** streamlines the extraction of **requirements** from both **textual** and **graphical inputs**, generates structured **SRS**/**BRD** or any types of requirement documents, and seamlessly integrates with **JIRA** for automated backlog updates and efficient **workflow management**.


## Objectives

- **Automate Requirement Extraction**  
  AI-driven analysis of documents and graphics to generate structured requirements, significantly reducing manual effort.

- **Streamline Documentation**  
  Automatically generate standardized SRS, SOW documents, and JIRA user stories to accelerate the documentation process based on user input, speeding up documentation process by **90 percent**.

- **Enhance Security**  
  Leverage privately deployed open source LLMs alongside Azure Blob Storage, MFA, and RBAC to ensure that all sensitive data remains secure and compliant.

- **Integrate with JIRA & Workplace Automation**  
  Seamlessly push updates to JIRA and automate workflow processes to ensure efficient backlog management.

- **Accelerate Testing**  
  AI-powered test case generation and code documentation reducing manual efforts by 70 percent.
  
- **Enable Multi-User Collaboration**  
  Support scalable, concurrent usage with role-based access control and versioned document management.

# USPs


The following are the Unique Selling Proposition Our Platform Offers

![image](https://github.com/user-attachments/assets/b6abc38f-4c13-4b28-926d-741c534c66d4)
## Impact
Project ATLAS delivers a robust, AI-powered solution that accelerates documentation, reduces manual intervention, and accelerates software development cycles. By ensuring data security and compliance through locally deployed models and secure cloud infrastructure, the platform significantly enhances operational efficiency and quality at Barclays.

# Market Analysis

![image](https://github.com/user-attachments/assets/e7869f52-7b7e-496f-bb13-ad77e7fb4389)

![image](https://github.com/user-attachments/assets/a57a8b13-d27d-4060-a9b3-e6383d56e3eb)



# Methodology Details
## Architecture(Please do Zoom in or do go for the link for more details:
![barclays-Page-1 (1)](https://github.com/user-attachments/assets/50108823-388d-48fb-8d61-6e497898695d)





## Design Considerations:

# Tech stack

![image](https://github.com/user-attachments/assets/7cb3e30f-1a3a-42e4-8e1e-bda50ef3085c)



# Security Aspects:
![image](https://github.com/user-attachments/assets/2895df0e-651d-4ec4-a5a1-4cd2f1ae99e8)



# Scalability

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

## Closing Remarks

Thank you very much for giving us an opportunity to show our idea. We have tried to show as much implementation and documentation as we can, and we really hope you like our idea.

We would love to work with Barclays on this project and would greatly appreciate any feedback from the judges!

[Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSeEYeO0i4gwhKAgsvP2TqNMkgJf6N86oUwLe16KCgaWIU-PBg/viewform)

~~Team Cyber Wardens
