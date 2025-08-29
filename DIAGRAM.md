sequenceDiagram
    autonumber
    participant FB as "Facebook Graph"
    participant API as "Webhook API (/webhooks/facebook)"
    participant DB as "DB (Pages ↔ Clients)"
    participant SYS as "Client System (webhookCallbackUrl)"

    rect rgb(255,255,255)
    note over FB,API: "Verification (one-time setup)"
    FB->>API: "GET /webhooks/facebook?hub.mode=subscribe&hub.verify_token&hub.challenge"
    API-->>FB: "Return hub.challenge if verify_token == FB_WEBHOOK_VERIFY_TOKEN"
    end

    note over FB,API: "Runtime event delivery"
    FB->>API: "POST /webhooks/facebook (event JSON) + X-Hub-Signature-256"
    API->>API: "Verify HMAC-SHA256 signature using FACEBOOK_APP_SECRET"
    API->>DB: "Find Page by entry.id (pageId) and its linked Client"
    DB-->>API: "Page + Client.webhookCallbackUrl"
    API->>SYS: "Forward event JSON to Client callback URL"
    SYS-->>API: "200 OK (optional body)"
    API-->>FB: "200 OK (ack)"