# POCKET OFFER BACKEND

### Description

Pocket Offer Backend provides all necessary API-Endpoints and Database-Management for the Smartphone Application Pocket Offer (https://github.com/Exulenood/pocket-offer.git).

### Features

- Session Management: Login, Logout and Revalidation routes
- Authorisation Checks for two separately issued Tokens at all API Endpoints (therefore all Get-Requests are handled with POST instead).
- Add, Store and retrieve User Data to/from database "users"
- Add, Store and retrieve Client Data to/from database "clients"
- Add, Store and retrieve Item Template Data to/from database "itemTemplates"
- Add, Store and retrieve Offer Data to/from database "offers"
- Add, Store and retrieve Terms Data to/from database "termsTemplates"
- Retrieve all necessary data for document creation from all databases with a single API Endpoint
- Database migration setup with ley

### Technologies

- Next.js 13
- PostgreSQL
- TypeScript
- JavaScript
- CSS

### List of API Endpoints

##### Auth

- login (POST)
- logout (POST)
- register (POST)
- revalidate (POST)

##### Clients

- createClient (POST)
- deleteClient (DELETE)
- getClients (POST)

##### Items

- addTemplateItem (POST)
- deleteTemplateItem (DELETE)
- getTemplateItem (POST)

##### Offers

- addPosition (POST)
- createOffer (POST)
- deleteOffer (DELETE)
- deletePosition (DELETE)
- editPosition (PUT)
- editTerms (PUT)
- getDocCreationData (POST)
- getMaxOfferId (POST)
- getOfferPositions (POST)
- getOffers (POST)

##### Users

- editUser (PUT)
- getUser (POST)
