
  # Micro-Entrepreneur Growth App

  This is a code bundle for Micro-Entrepreneur Growth App. The original project is available at https://www.figma.com/design/oKVuDUQ1ePbwev4Exdjvy3/Micro-Entrepreneur-Growth-App.

  ## Features

  - Customer Management
  - Referral System
  - Digital Presence Builder
  - Analytics Dashboard
  - **AI-Powered Marketing Assistant** - Automated content generation for social media, email campaigns, and customer outreach

  ## Running the code

  1. Run `npm i` to install the dependencies.

  2. Run `npm run dev` to start the development server.

  3. For the backend, navigate to the `backend` directory and run:
     ```bash
     python -m venv venv
     source venv/bin/activate  # On Windows: venv\Scripts\activate
     pip install -r requirements.txt
     python app/init_db.py
     uvicorn app.main:app --reload
     ```

  4. To use the AI Marketing Assistant, you need to set up a Google Gemini API key:
     - Copy `.env.example` to `.env` in the backend directory
     - Add your Gemini API key: `GEMINI_API_KEY=your-api-key-here`

  ## AI Marketing Assistant

  The AI Marketing Assistant helps micro-entrepreneurs create engaging content for:
  - Social media posts (WhatsApp, Facebook, Instagram, LinkedIn, Twitter)
  - Email campaigns
  - Customer outreach messages

  For detailed information on how to use the AI Marketing Assistant effectively, see the [AI Marketing Assistant Guide](docs/ai-marketing-assistant-guide.md).
  