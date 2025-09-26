# Spiff Management System Setup Guide

## Phase 1: Core Infrastructure ✅ COMPLETED

### What's Been Implemented

1. **Database Schema** (`spiff_schema.sql`)
   - `spiff_categories` table with 5 categories
   - `spiff_types` table with 14 pre-configured spiff types
   - `monthly_spiffs` table for spiff assignments
   - All tables include proper foreign keys and indexes

2. **API Endpoints** (`routes/spiffs.js`)
   - GET `/api/spiffs/categories` - List all spiff categories
   - GET `/api/spiffs/types` - List all spiff types (with optional category filter)
   - GET `/api/spiffs/monthly` - Get monthly spiffs for a specific month/year
   - POST `/api/spiffs/monthly` - Create a new monthly spiff
   - PUT `/api/spiffs/monthly/:id` - Update an existing spiff
   - DELETE `/api/spiffs/monthly/:id` - Delete a spiff
   - GET `/api/spiffs/summary/:month/:year` - Get spiff summary for a month

3. **Admin Interface** (`SpiffManagement.js`)
   - Modern Material-UI interface
   - Summary dashboard with key metrics
   - Add/Edit/Delete spiffs functionality
   - Status management (draft, pending, approved, paid, cancelled)
   - Integration with existing salesperson data

### Setup Instructions

1. **Run the Database Migration**
   ```bash
   cd backend
   node migrate_spiffs.js
   ```

2. **Start the Backend Server**
   ```bash
   npm start
   ```

3. **Start the Frontend**
   ```bash
   cd ../frontend
   npm start
   ```

4. **Access Spiff Management**
   - Login as an admin or manager
   - Navigate to "Spiff Management" in the sidebar
   - Start creating and managing spiffs!

### Current Spiff Types Available

#### Product Performance Spiffs
- VSC Bonus ($50 each)
- Cilajet Bonus ($50 each)
- Tire & Wheel Protection Bonus ($50 each)
- LoJack Bonus ($50 each)
- Maintenance Bonus - MINI ($50 each)
- Excess Wear & Tear Bonus - MINI ($50 each)

#### Volume/Unit Spiffs
- Unit Bonus ($500 for 10+ units)
- Demo Vehicle Allowance ($300 for 8+ units)

#### Contest Spiffs
- Sales Contest Winner
- Product Penetration Leader

#### Manufacturer Spiffs
- BMW Factory Incentive
- MINI Factory Incentive

#### Special Recognition
- Employee of the Month
- Customer Service Excellence

### Next Steps (Phase 2)

The next phase will include:
1. **Payroll Integration** - Automatically include spiffs in payroll calculations
2. **Approval Workflow** - Manager approval process for spiffs
3. **Enhanced Reporting** - Spiff effectiveness and cost analysis

### Usage Examples

1. **Adding a Monthly Spiff**
   - Click "Add Spiff" button
   - Select month/year, salesperson, spiff type
   - Enter amount and description
   - Save as draft or submit for approval

2. **Managing Spiff Status**
   - Draft → Pending → Approved → Paid
   - Use the action buttons in the table to change status
   - Track approval and payment dates

3. **Viewing Spiff Summary**
   - Dashboard shows total spiffs, amounts, and status counts
   - Filter by month/year to see historical data
   - Export capabilities coming in Phase 3

### API Usage Examples

```javascript
// Get all spiff categories
GET /api/spiffs/categories

// Get spiff types for a specific category
GET /api/spiffs/types?category_id=1

// Get monthly spiffs for December 2024
GET /api/spiffs/monthly?month=12&year=2024

// Create a new spiff
POST /api/spiffs/monthly
{
  "month": 12,
  "year": 2024,
  "salesperson_id": 1,
  "spiff_type_id": 1,
  "amount": 50.00,
  "description": "VSC bonus for December"
}

// Update spiff status
PUT /api/spiffs/monthly/1
{
  "status": "approved"
}
```

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the database migration completed successfully
3. Ensure the backend server is running on port 3001
4. Check that all required tables were created

The system is now ready for basic spiff management! 🎉
