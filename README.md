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

## 📁 Project Structure

```
xpenses/
├── index.html              # Main dashboard
├── allowance.html          # Allowance management page
├── chart.html             # Analytics and charts page
├── manifest.json          # PWA configuration
├── database.sql           # Database schema and sample data
├── css/
│   ├── style.css          # Main stylesheet
│   └── chart.css          # Chart-specific styles
├── js/
│   ├── app.js             # Main application logic
│   ├── allowance.js       # Allowance management logic
│   ├── chart.js           # Chart and analytics logic
│   ├── key_check.js       # Authentication logic
│   └── modal-toast.js     # UI components
├── api/
│   ├── dbinfo.php         # Database configuration
│   ├── key.php            # Access key validation
│   ├── add_transaction.php # Add new expense
│   ├── add_allowance.php  # Add new allowance
│   ├── expense_table.php  # Get expense data
│   ├── allowance_table.php # Get allowance data
│   ├── expense_data.php   # Analytics data
│   └── delete_transaction.php # Delete transactions
├── icons/                 # PWA icons and UI icons
└── image/                 # App icons and images
```

## 🚀 Installation & Setup

### Prerequisites

- XAMPP (Apache + MySQL + PHP)
- Web browser with PWA support

### Installation Steps

1. **Clone/Download the Project**

   ```bash
   # Place the project in your XAMPP htdocs directory
   # Default path: C:\xampp\htdocs\xpenses
   ```

2. **Database Setup**

   ```bash
   # Start XAMPP services (Apache and MySQL)
   # Import the database schema
   mysql -u root -p < database.sql
   ```

3. **Database Configuration**

   - Edit `api/dbinfo.php` to match your MySQL configuration:

   ```php
   $host = 'localhost';
   $username = 'root';
   $password = 'your_password';
   $dbname = 'xpenses_db';
   $port = '3306'; // or your MySQL port
   ```

4. **Access the Application**
   - Open your browser and navigate to: `http://localhost/xpenses`
   - The application will prompt for an access key

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

## 🚀 Deployment

### Local Development

- Use XAMPP for local development
- Access via `http://localhost/xpenses`

### Production Deployment

1. Upload files to web server
2. Configure database connection
3. Set up SSL certificate
4. Configure web server for PWA support
5. Update access key for security

## 📊 Sample Data

The application comes with sample data including:

- Sample expense transactions across various categories
- Sample allowance records with MMK/THB conversions
- Pre-configured categories for common expenses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:

- Check the documentation
- Review the code comments
- Create an issue for bugs or feature requests

## 🔄 Version History

- **v1.0.0**: Initial release with basic expense tracking
- **v1.1.0**: Added allowance management and multi-currency support
- **v1.2.0**: Implemented PWA features and analytics dashboard

---

**Xpenses** - Making expense tracking simple and efficient! 💰📱
