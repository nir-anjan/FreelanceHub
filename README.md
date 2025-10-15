# FreelanceMarketplace

A comprehensive full-stack web application that connects freelancers with clients, featuring real-time chat, secure payments, and administrative oversight.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nir-anjan/FreelanceMarketplace.git
   cd FreelanceMarketplace
   ```

2. **Backend Setup**
   ```bash
   # Create virtual environment
   python -m venv env
   
   # Activate virtual environment
   # Windows:
   env\Scripts\activate
   # macOS/Linux:
   source env/bin/activate
   
   # Install dependencies
   pip install -r backend/requirements.txt
   
   # Setup database
   cd backend
   python manage.py migrate
   python manage.py createsuperuser
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` files:
   
   **Backend** (`backend/.env`):
   ```env
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=postgresql://user:password@localhost:5432/freelance_db
   RAZORPAY_KEY_ID=your-razorpay-key
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   ```
   
   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:8007/api
   VITE_DJANGO_BASE_URL=http://localhost:8007
   VITE_RAZORPAY_KEY_ID=your-razorpay-key
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8007
   ```

2. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:8081
   - Backend API: http://localhost:8007/api
   - Admin Panel: http://localhost:8081/admin

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React/TS      │◄──►│   Django RF     │◄──►│   PostgreSQL    │
│   Port: 8081    │    │   Port: 8007    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────►│   Socket.IO     │
                        │   Real-time     │
                        └─────────────────┘
```

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Vite (Build Tool)
- Socket.IO Client
- Axios

**Backend:**
- Django 5.2.7 + Django REST Framework
- Socket.IO Server
- JWT Authentication
- Razorpay Integration
- PostgreSQL

## 📋 Features

### Core Features
- 🔐 **Authentication** - Role-based user system (Client/Freelancer/Admin)
- 💼 **Job Management** - Post, browse, and manage job listings
- 👥 **User Profiles** - Comprehensive freelancer and client profiles
- 💬 **Real-time Chat** - Socket.IO powered messaging system
- 💳 **Payment Processing** - Secure Razorpay integration
- 🔍 **Search & Discovery** - Advanced job and freelancer search

### Admin Features
- 📊 **Analytics Dashboard** - Revenue and user growth analytics
- 👨‍💼 **User Management** - Comprehensive user oversight
- 📝 **Job Moderation** - Job approval and content review
- 💰 **Transaction Monitoring** - Payment tracking and management
- ⚖️ **Dispute Resolution** - Built-in conflict resolution system

### Advanced Features
- 🌐 **Public Listings** - SEO-optimized job and freelancer pages
- 📱 **Responsive Design** - Mobile-first responsive interface
- 🔄 **Real-time Updates** - Live notifications and status updates
- 🛡️ **Security** - JWT tokens, CORS, SQL injection protection

## 📁 Project Structure

```
FreelanceMarketplace/
├── 📄 README.md                      # This file
├── 📄 COMPREHENSIVE_DOCUMENTATION.md # Complete documentation
├── 📁 frontend/                      # React TypeScript frontend
│   ├── 📁 src/
│   │   ├── 📁 components/           # UI components
│   │   ├── 📁 pages/                # Page components
│   │   ├── 📁 admin/                # Admin dashboard
│   │   ├── 📁 services/             # API services
│   │   └── 📁 types/                # TypeScript definitions
│   └── 📄 package.json
├── 📁 backend/                       # Django backend
│   ├── 📁 api/auth/                 # Authentication & users
│   ├── 📁 chat/                     # Chat system
│   ├── 📁 payment/                  # Payment processing
│   ├── 📁 disputes/                 # Dispute management
│   └── 📄 manage.py
├── 📁 testing/                       # All test files
│   ├── 📄 README.md                 # Testing documentation
│   ├── 📄 test_*.py                 # Python tests
│   └── 📄 *.html                    # HTML test pages
└── 📁 docs_archive/                  # Archived documentation
```

## 🧪 Testing

All test files are organized in the `testing/` directory:

```bash
# Run API tests
python testing/test_api_endpoints.py

# Run chat system tests
python testing/test_chat_system.py

# Run payment tests
python testing/test_payment_endpoints.py

# Django test suite
cd backend && python manage.py test
```

For detailed testing information, see [`testing/README.md`](testing/README.md).

## 🔧 Development

### API Endpoints

**Authentication:**
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/admin/login/` - Admin login

**Jobs:**
- `GET /api/auth/jobs/` - List jobs
- `POST /api/auth/jobs/create/` - Create job
- `GET /api/auth/jobs/{id}/` - Job details

**Chat:**
- `GET /api/auth/inbox/` - Chat threads
- `GET /api/auth/inbox/{id}/messages/` - Messages

**Admin:**
- `GET /api/auth/admin/overview/` - Dashboard stats
- `GET /api/auth/admin/users/` - User management
- `GET /api/auth/admin/transactions/` - Transactions

### Default Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`

### Database Schema

Key models include:
- **User** - Authentication and roles
- **Client/Freelancer** - Profile extensions
- **Job** - Job listings and management
- **ChatThread/ChatMessage** - Messaging system
- **Payment** - Transaction tracking
- **Dispute** - Conflict resolution

## 📖 Documentation

- **[Complete Documentation](COMPREHENSIVE_DOCUMENTATION.md)** - Comprehensive project documentation
- **[Testing Guide](testing/README.md)** - Testing procedures and organization
- **[API Documentation](docs_archive/)** - Archived API documentation

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   # Backend production settings
   DEBUG=False
   ALLOWED_HOSTS=yourdomain.com
   DATABASE_URL=postgresql://prod-user:pass@prod-db:5432/prod-db
   
   # Frontend production build
   npm run build
   ```

2. **Server Configuration**
   - Use ASGI server (daphne/uvicorn)
   - Configure reverse proxy (Nginx)
   - Set up SSL certificates
   - Configure PostgreSQL

3. **Database Migration**
   ```bash
   python manage.py migrate
   python manage.py collectstatic
   python manage.py createsuperuser
   ```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📋 Development Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Video call integration
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] Automated testing pipeline

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the [comprehensive documentation](COMPREHENSIVE_DOCUMENTATION.md)
- Review the [testing guide](testing/README.md)

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ by the FreelanceMarketplace Team**

*Last Updated: October 15, 2025*