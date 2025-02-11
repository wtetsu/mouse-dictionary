Place a PDF.js-based viewer here.

https://github.com/wtetsu/pdf.js

----

This sequence diagram illustrates how Mouse Dictionary displays a web-based PDF file within its built-in PDF viewer.  The complexity arises from the following limitations:

- The different parts of the extension (Main, Background, Options Page, PDF Viewer) can't directly share data with each other. They have to communicate by sending messages.
-  Because messages can only be text, the PDF is converted to Base64 (a text representation of the PDF) before being sent.



```mermaid
sequenceDiagram
    participant MD as Mouse Dictionary
    participant W as Web
    participant B as Mouse Dictionary (Background)
    participant O as Mouse Dictionary (Options Page)
    participant V as PDF Viewer

    MD->>W: Request PDF file
    W->>MD: PDF file
    MD->>MD: Encode PDF to Base64
    MD->>B: open_pdf(Base64 data)

    activate B
    B->>B: Generate unique ID, save to QueueDict
    B->>O: openOptionsPage()
    deactivate B

    alt Options page is new
        O->>B: shift_pdf_id (on initialization)
    else Options page already exists
        B-->>O: prepare_pdf received
        O->>B: shift_pdf_id
    end
    activate B
    B->>B: Get oldest ID from QueueDict
    B->>O: sendResponse(ID)
    deactivate B

    activate O
    O->>V: Open PDF viewer (URL?id=ID)
    deactivate O

    activate V
    V->>B: get_pdf_data(ID)
    activate B
    B->>B: Get Base64 corresponding to ID from QueueDict
    B->>V: sendResponse(Base64 data)
    deactivate B
    V->>V: Decode Base64 to binary, display PDF
    deactivate V
```
