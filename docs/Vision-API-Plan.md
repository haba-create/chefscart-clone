# Vision API & Photo Upload - Phase 3 Planning

## Overview

Implement photo upload and Vision API capabilities to automatically track groceries, parse receipts, and manage home inventory through camera integration.

Reference: [Claude Vision API Documentation](https://docs.claude.com/en/docs/vision)

---

## Use Cases

### 1. Receipt Scanning
**User Flow:**
1. User takes photo of grocery receipt
2. AI extracts: items, quantities, prices, store, date
3. System compares with shopping list
4. Updates purchase history
5. Calculates actual vs. estimated budget

**Benefits:**
- Automatic expense tracking
- Price verification
- Budget accuracy
- Purchase history database

---

### 2. Pantry/Fridge Inventory
**User Flow:**
1. User takes photo of pantry/fridge shelves
2. AI identifies all visible items
3. System updates inventory database
4. Flags low-stock items
5. Suggests replenishment

**Benefits:**
- Visual inventory management
- No manual data entry
- Prevents duplicate purchases
- Reduces food waste

---

### 3. Product Identification
**User Flow:**
1. User photographs product in store
2. AI identifies product and brand
3. System searches for prices across stores
4. Provides recommendations
5. Adds to shopping list if desired

**Benefits:**
- In-store price comparison
- Product recommendations
- Nutritional information
- Alternative suggestions

---

## Technical Implementation

### API Integration

**Model:** `claude-sonnet-4-5-20250929` (supports vision)

**Example Request:**
```typescript
const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          type: 'text',
          text: 'Extract all items and prices from this grocery receipt. Return as JSON with fields: items (name, quantity, price), store, date, total.',
        },
      ],
    },
  ],
});
```

---

### Data Structures

#### Receipt Data
```typescript
interface ReceiptScan {
  id: string;
  userId: string;
  imageUrl: string;
  uploadedAt: Date;
  parsedData: {
    store: string;
    date: string;
    total: number;
    tax?: number;
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      category?: string;
    }>;
  };
  verified: boolean;
  corrections?: any;
}
```

#### Inventory Item
```typescript
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: 'pantry' | 'fridge' | 'freezer';
  expiryDate?: Date;
  lastUpdated: Date;
  imageUrl?: string;
  lowStockThreshold?: number;
  autoReplenish: boolean;
}
```

#### Product Scan
```typescript
interface ProductScan {
  id: string;
  imageUrl: string;
  scannedAt: Date;
  productInfo: {
    name: string;
    brand: string;
    category: string;
    estimatedPrice: number;
    nutritionalInfo?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      allergens?: string[];
    };
  };
  prices: {
    [store: string]: number;
  };
  alternatives?: string[];
}
```

---

## Frontend Components

### PhotoUpload Component
```typescript
interface PhotoUploadProps {
  type: 'receipt' | 'pantry' | 'product';
  onUpload: (file: File) => Promise<void>;
  onAnalysisComplete: (data: any) => void;
}

// Usage
<PhotoUpload
  type="receipt"
  onUpload={handleReceiptUpload}
  onAnalysisComplete={(data) => {
    addPurchaseHistory(data);
    updateBudget(data.total);
  }}
/>
```

### CameraCapture Component
```typescript
interface CameraCaptureProps {
  mode: 'photo' | 'video';
  onCapture: (blob: Blob) => void;
  facingMode: 'user' | 'environment';
}

// Mobile-optimized camera interface
<CameraCapture
  mode="photo"
  facingMode="environment"
  onCapture={handleCapture}
/>
```

### InventoryViewer Component
```typescript
interface InventoryViewerProps {
  items: InventoryItem[];
  onRefresh: () => void;
  onItemUpdate: (itemId: string, changes: Partial<InventoryItem>) => void;
}
```

---

## API Endpoints

### POST /api/vision/receipt
```typescript
// Upload and parse receipt
{
  image: File | base64,
  userId: string
}

// Response
{
  receiptId: string,
  parsedData: ReceiptScan['parsedData'],
  confidence: number,
  reviewRequired: boolean
}
```

### POST /api/vision/pantry
```typescript
// Scan pantry/fridge
{
  image: File | base64,
  location: 'pantry' | 'fridge' | 'freezer',
  userId: string
}

// Response
{
  scanId: string,
  items: InventoryItem[],
  added: string[],
  removed: string[],
  updated: string[]
}
```

### POST /api/vision/product
```typescript
// Identify product
{
  image: File | base64,
  userId: string
}

// Response
{
  productId: string,
  info: ProductScan['productInfo'],
  prices: { [store: string]: number },
  inStock: boolean
}
```

---

## Storage

### Image Storage Options

**Option 1: Cloudinary**
```bash
npm install cloudinary
```

**Option 2: AWS S3**
```bash
npm install @aws-sdk/client-s3
```

**Option 3: Supabase Storage**
```bash
npm install @supabase/supabase-js
```

**Recommendation:** Cloudinary
- Easy integration
- Automatic optimization
- Image transformations
- CDN included

---

## Database Schema

### Receipts Table
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  image_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  store VARCHAR(100),
  purchase_date DATE,
  total DECIMAL(10,2),
  tax DECIMAL(10,2),
  items JSONB,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Inventory Table
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  quantity DECIMAL(10,2),
  unit VARCHAR(50),
  location VARCHAR(50),
  expiry_date DATE,
  low_stock_threshold DECIMAL(10,2),
  auto_replenish BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Product_Scans Table
```sql
CREATE TABLE product_scans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  image_url TEXT NOT NULL,
  product_name VARCHAR(200),
  brand VARCHAR(100),
  category VARCHAR(100),
  estimated_price DECIMAL(10,2),
  nutritional_info JSONB,
  prices JSONB,
  scanned_at TIMESTAMP DEFAULT NOW()
);
```

---

## AI Prompts

### Receipt Parsing Prompt
```typescript
const RECEIPT_PROMPT = `Analyze this grocery receipt image and extract all information in JSON format.

Required fields:
- store: Store name
- date: Purchase date (YYYY-MM-DD)
- total: Total amount paid
- tax: Tax amount (if shown)
- items: Array of items with:
  - name: Item name
  - quantity: Number purchased
  - unitPrice: Price per unit
  - totalPrice: Total for this item
  - category: Food category (Dairy, Meat, Produce, etc.)

Rules:
- Be accurate with prices (double-check decimal places)
- Standardize item names (e.g., "Org Mlk" → "Organic Milk")
- Infer quantities if not explicit (assume 1 if unclear)
- Categorize items appropriately
- Flag any uncertain extractions

Return ONLY valid JSON.`;
```

### Pantry Scanning Prompt
```typescript
const PANTRY_PROMPT = `Analyze this pantry/fridge photo and identify all visible food items.

For each item, provide:
- name: Product name
- category: Food category
- quantity: Estimated quantity (number of items, packages, etc.)
- unit: Unit of measurement
- expiryRisk: 'low' | 'medium' | 'high' (based on product type)

Rules:
- List only clearly visible items
- Estimate quantities conservatively
- Group similar items (e.g., "3 cans of beans")
- Flag items that may expire soon
- Identify brand names when visible

Return as JSON array.`;
```

### Product Identification Prompt
```typescript
const PRODUCT_PROMPT = `Identify this product and provide detailed information.

Required information:
- name: Full product name
- brand: Brand name
- category: Product category
- estimatedPrice: Typical UK price (£)
- nutritionalInfo: Basic nutrition facts if recognizable
- allergens: Common allergens present
- alternatives: 2-3 similar products

Also suggest:
- Best stores to buy this product
- Cheaper alternatives
- Health rating (1-5 stars)

Return as structured JSON.`;
```

---

## Implementation Phases

### Phase 3.1: Receipt Scanning
**Week 1-2**
- [ ] Setup Cloudinary/S3 for image storage
- [ ] Create PhotoUpload component
- [ ] Implement Vision API integration
- [ ] Build receipt parsing logic
- [ ] Create purchase history UI
- [ ] Test with real receipts

### Phase 3.2: Inventory Management
**Week 3-4**
- [ ] Create CameraCapture component
- [ ] Build pantry scanning UI
- [ ] Implement inventory database
- [ ] Create inventory viewer
- [ ] Add low-stock alerts
- [ ] Implement auto-replenishment suggestions

### Phase 3.3: Product Scanning
**Week 5-6**
- [ ] Build product scanner UI
- [ ] Implement product identification
- [ ] Create price comparison from scan
- [ ] Add nutritional info display
- [ ] Implement "Add to list" from scan
- [ ] Test in-store scanning workflow

---

## User Experience

### Mobile-First Design
```typescript
// Optimized for mobile cameras
<div className="camera-view">
  <video autoPlay playsInline />
  <div className="camera-overlay">
    <div className="scan-frame" />
    <p>Position receipt within frame</p>
  </div>
  <button onClick={capturePhoto}>
    📸 Capture
  </button>
</div>
```

### Progressive Enhancement
1. Desktop: File upload
2. Mobile: Camera capture
3. Fallback: Manual entry

### Loading States
```typescript
<div className="scan-progress">
  <Spinner />
  <p>Analyzing receipt...</p>
  <p className="text-sm">This may take 5-10 seconds</p>
</div>
```

---

## Privacy & Security

### Image Handling
- **Storage**: Encrypted at rest
- **Transmission**: HTTPS only
- **Retention**: 30 days, then auto-delete
- **Access**: User-only (no sharing)

### Data Extraction
- **No PII**: Don't extract credit card numbers, names
- **Receipt data only**: Items, prices, store, date
- **User consent**: Clear terms about image processing

### GDPR Compliance
- Right to deletion
- Data export capability
- Clear privacy policy
- Opt-in for image processing

---

## Testing

### Image Test Suite
```typescript
describe('Receipt Scanning', () => {
  it('should extract items from Tesco receipt', async () => {
    const result = await scanReceipt(tescoReceiptImage);
    expect(result.store).toBe('Tesco');
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('should handle poor quality images', async () => {
    const result = await scanReceipt(blurryImage);
    expect(result.confidence).toBeLessThan(0.7);
    expect(result.reviewRequired).toBe(true);
  });
});
```

### Real Receipt Tests
- Tesco receipts
- Sainsbury's receipts
- Waitrose receipts
- M&S receipts
- Handwritten lists
- Digital receipts

---

## Performance Optimization

### Image Preprocessing
```typescript
// Compress before upload
async function preprocessImage(file: File): Promise<Blob> {
  const maxWidth = 1024;
  const maxHeight = 1024;
  const quality = 0.8;

  return await compressImage(file, { maxWidth, maxHeight, quality });
}
```

### Caching
```typescript
// Cache Vision API results
const receiptCache = new Map<string, ReceiptScan>();

async function scanReceipt(imageHash: string, image: File) {
  if (receiptCache.has(imageHash)) {
    return receiptCache.get(imageHash);
  }

  const result = await visionAPI.analyze(image);
  receiptCache.set(imageHash, result);
  return result;
}
```

---

## Cost Management

### API Usage Optimization
- **Batch processing**: Process multiple items in one request
- **Image compression**: Reduce token count
- **Caching**: Avoid duplicate requests
- **Model selection**: Use Haiku for simple scans, Sonnet for complex

### Budget Estimates
| Feature | Monthly Requests | Cost per Request | Monthly Cost |
|---------|------------------|------------------|--------------|
| Receipt Scan | 100 | $0.10 | $10 |
| Pantry Scan | 50 | $0.15 | $7.50 |
| Product Scan | 200 | $0.05 | $10 |
| **Total** | **350** | - | **$27.50** |

---

## Success Metrics

### Accuracy
- Receipt parsing accuracy > 95%
- Product identification accuracy > 90%
- Inventory detection accuracy > 85%

### User Engagement
- % of users uploading receipts
- Average scans per user/month
- Feature retention rate

### Business Impact
- Reduction in manual data entry
- Improved budget accuracy
- Increase in app usage time
- Higher user satisfaction scores

---

## Future Enhancements

### Voice Commands
"Hey Claude, scan this receipt"
"Add to inventory what you see"

### AR Integration
Real-time overlay on camera feed
In-store price comparison via AR

### Barcode Scanning
Complement vision with barcode API
Faster product identification

### Meal Recognition
Scan cooked meals
Track consumption patterns
Suggest recipes from inventory

---

## Documentation

All vision features documented at:
- [Claude Vision API](https://docs.claude.com/en/docs/vision)
- `/docs/API.md` - Vision endpoints
- `/docs/Claude.md` - Vision model usage
- Component docs in Storybook

---

## Support & Troubleshooting

### Common Issues

**"Image too large"**
→ Compress to < 5MB before upload

**"Low confidence extraction"**
→ Better lighting, clear photo, flat surface

**"Store not recognized"**
→ Manual store selection option

**"Items missing"**
→ Review UI to add missed items

---

## Next Steps

1. ✅ Document vision API plan (this file)
2. ⏳ Setup image storage (Cloudinary)
3. ⏳ Implement PhotoUpload component
4. ⏳ Integrate Vision API for receipts
5. ⏳ Build purchase history database
6. ⏳ Test with real receipts
7. ⏳ Deploy Phase 3.1
8. ⏳ Gather user feedback
9. ⏳ Iterate on accuracy
10. ⏳ Roll out pantry & product scanning
