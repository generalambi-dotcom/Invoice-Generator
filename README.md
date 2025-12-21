# Invoice Generator

A complete, production-ready invoice generator built with modern web technologies. Create professional invoices quickly and easily with PDF export functionality.

## Features

### Core Functionality
- ✅ Create professional invoices
- ✅ Add multiple line items
- ✅ Automatic calculations (subtotal, tax, totals)
- ✅ PDF generation and download
- ✅ Logo upload support
- ✅ Save company defaults
- ✅ Invoice history (localStorage)

### Customization
- ✅ 5 theme colors (Slate, Blue, Green, Purple, Red)
- ✅ 6 currencies (GBP, USD, EUR, JPY, CAD, AUD)
- ✅ Optional ship-to address
- ✅ Notes, bank details, terms sections
- ✅ Tax, discount, shipping support

### Technical Features
- ✅ TypeScript for type safety
- ✅ Responsive design (works on all devices)
- ✅ Clean, modular code architecture
- ✅ Well-documented and commented
- ✅ Ready for Cursor AI enhancement

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

**Option 1: Using Setup Scripts**

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
Double-click `setup.bat` or run in Command Prompt:
```cmd
setup.bat
```

**Option 2: Manual Installation**
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
invoice-generator/
├── app/
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── InvoiceForm.tsx   # Main form component (500+ lines)
│   └── LineItems.tsx     # Line items table component
├── lib/
│   ├── calculations.ts   # Math utilities
│   ├── pdf-generator.tsx # PDF template
│   └── storage.ts        # localStorage handling
├── types/
│   └── invoice.ts        # TypeScript definitions
└── Configuration files...
```

## Usage Guide

### Creating Your First Invoice

1. **Fill in Company Information**
   - Enter your company name (required)
   - Add company address, contact details
   - Optionally upload a logo
   - Click "Save as Default" to auto-fill future invoices

2. **Enter Client Information**
   - Client name (required)
   - Client address and contact details

3. **Set Invoice Details**
   - Invoice number (required)
   - Invoice date and due date (required)
   - Optional PO number

4. **Add Line Items**
   - Click "Add Line Item" to add products/services
   - Enter description, quantity, and rate
   - Amount is calculated automatically

5. **Configure Additional Charges**
   - Set tax rate (percentage)
   - Set discount rate (percentage)
   - Add shipping charges

6. **Add Additional Information** (Optional)
   - Notes
   - Bank details
   - Terms & conditions

7. **Generate PDF**
   - Review the preview on the right
   - Click "Download PDF" to generate and download

### Managing Invoices

- **View History**: Click "Show History" to see all saved invoices
- **Load Invoice**: Click "Load" on any invoice in history to edit it
- **Delete Invoice**: Click "Delete" to remove an invoice from history
- **New Invoice**: Click "New Invoice" to start fresh

### Customization

**Change Theme:**
Select from 5 color themes in the Settings section:
- Slate (default)
- Blue
- Green
- Purple
- Red

**Change Currency:**
Select from 6 supported currencies:
- GBP (£)
- USD ($)
- EUR (€)
- JPY (¥)
- CAD (C$)
- AUD (A$)

## Technical Details

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: @react-pdf/renderer
- **Date Handling**: date-fns
- **Storage**: localStorage (browser API)

### Data Storage

Currently, all data is stored in the browser's localStorage:
- Invoices are saved locally on your computer
- Company defaults are saved for auto-fill
- Data is not accessible from other devices
- Consider database migration for production use

### PDF Generation

PDFs are generated client-side:
- Fast and responsive
- No server needed
- Works offline
- Professional layout with all invoice details

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Structure

- **Components**: React components in `components/`
- **Utilities**: Helper functions in `lib/`
- **Types**: TypeScript definitions in `types/`
- **Styles**: Global styles in `app/globals.css`

## Customization Guide

### Adding New Fields

To add a new field to the invoice:

1. Update `types/invoice.ts` to add the field to the `Invoice` interface
2. Add the input field in `components/InvoiceForm.tsx`
3. Update `lib/pdf-generator.tsx` to display the field in the PDF

### Changing Colors

Edit `tailwind.config.js` or modify the theme colors in `types/invoice.ts`:
```typescript
export const themeColors: Record<Theme, {...}> = {
  // Add or modify theme colors
}
```

### Modifying PDF Layout

Edit `lib/pdf-generator.tsx` to customize the PDF template:
- Adjust styles in the `StyleSheet.create()` object
- Modify the component structure
- Add or remove sections

## Troubleshooting

### PDF Generation Fails
- Ensure all required fields are filled (Invoice Number, Company Name, Client Name)
- Check browser console for errors
- Try refreshing the page

### Data Not Saving
- Check browser localStorage is enabled
- Clear browser cache and try again
- Check browser console for errors

### Styling Issues
- Clear browser cache
- Restart the development server
- Check that Tailwind CSS is properly configured

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal and commercial use.

## Support

For issues, questions, or contributions:
1. Check the documentation files
2. Review `CURSOR_GUIDE.md` for Cursor AI tips
3. See `ROADMAP.md` for planned features

## Future Enhancements

See `ROADMAP.md` for a list of planned features and improvements.

---

**Happy Invoicing!** 🎉

