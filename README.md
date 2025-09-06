# Xpenses - Smart Expense Tracker

A comprehensive Progressive Web Application (PWA) for tracking personal expenses and allowance management with multi-currency support (THB/MMK).

## 🌟 Features

### 📊 Financial Dashboard

- **Real-time Statistics**: Daily, monthly, and total expense tracking
- **Daily Change Tracking**: Monitor spending patterns with day-over-day comparisons
- **Multi-currency Support**: Track expenses in Thai Baht (THB) and Myanmar Kyat (MMK)
- **Quick Expense Entry**: Streamlined form for adding new transactions

### 💰 Allowance Management

- **Multi-currency Allowance Tracking**: Record allowances in MMK with automatic THB conversion
- **Currency Rate Management**: Track exchange rates for accurate conversions
- **Transfer History**: Complete record of who sent allowances and when
- **Monthly Allowance Analytics**: View allowance patterns and totals

### 📈 Analytics & Reporting

- **Interactive Charts**: Pie charts for category breakdown and line charts for spending trends
- **Date Range Filtering**: Analyze expenses over different time periods (7 days, 30 days, 90 days, all time)
- **Category Analysis**: Visual breakdown of spending by category
- **CSV Export**: Download transaction data for external analysis

### 🔐 Security & Access Control

- **Access Key Protection**: Secure access to the application with password protection
- **Session Management**: Persistent login sessions for convenience

### 📱 Progressive Web App

- **Offline Capability**: Works without internet connection
- **Mobile Responsive**: Optimized for mobile and desktop devices
- **App-like Experience**: Installable on mobile devices
- **Fast Loading**: Optimized performance with prefetching

## 🛠️ Technology Stack

### Frontend

- **HTML5**: Semantic markup with PWA capabilities
- **CSS3**: Modern styling with responsive design
- **JavaScript (ES6+)**: Interactive functionality
- **jQuery**: DOM manipulation and AJAX requests
- **Chart.js**: Interactive data visualization

### Backend

- **PHP**: Server-side logic and API endpoints
- **MySQL**: Database management
- **XAMPP**: Local development environment

### Database Schema

- **transactions**: Expense records with date, category, description, and amount
- **allowance**: Allowance records with MMK amounts, exchange rates, and THB conversions

## 🔧 Configuration

### Access Key Setup

- The application uses a simple access key system for security
- Configure your access key in `api/key.php`
- Default access key can be set during initial setup

### Database Configuration

- Update connection details in `api/dbinfo.php`
- Ensure MySQL service is running on the specified port
- Database name: `xpenses_db`

### PWA Configuration

- Icons are located in the `image/` directory
- PWA settings are configured in `manifest.json`
- Service worker functionality can be added for enhanced offline support

## 📱 Usage

### Adding Expenses

1. Navigate to the main dashboard
2. Fill in the expense form:
   - Select date
   - Choose category
   - Enter description
   - Input amount
3. Click "Add Expense"

### Managing Allowances

1. Go to the Allowance page
2. Enter allowance details:
   - Date of transfer
   - Amount in MMK
   - Current exchange rate
   - Sender information
3. Click "Add Allowance"

### Viewing Analytics

1. Access the Charts page
2. Select date range for analysis
3. View category breakdown and spending trends
4. Export data as CSV if needed

## 🎨 Customization

### Adding New Categories

- Categories are dynamically loaded from the database
- Add new categories by inserting records into the transactions table
- Categories will automatically appear in the dropdown

### Styling

- Main styles are in `css/style.css`
- Chart-specific styles are in `css/chart.css`
- Modify colors, fonts, and layout as needed

### Currency Support

- Currently supports THB and MMK
- To add new currencies, modify the database schema and update the frontend logic

## 🔒 Security Considerations

- **Access Key**: Implement proper authentication for production use
- **Database Security**: Use prepared statements and input validation
- **HTTPS**: Enable SSL/TLS for production deployment
- **Input Validation**: Sanitize all user inputs

## 📊 Sample Data

The application comes with sample data including:

- Sample expense transactions across various categories
- Sample allowance records with MMK/THB conversions
- Pre-configured categories for common expenses

## 🔄 Version History

- **v1.0.0**: Initial release with basic expense tracking
- **v1.1.0**: Added allowance management and multi-currency support
- **v1.2.0**: Implemented PWA features and analytics dashboard

---

**Xpenses** - Making expense tracking simple and efficient! 💰📱
