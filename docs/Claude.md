# Claude AI Models Documentation

## Approved Models for ChefsCart

This document specifies the approved Claude models for use in the ChefsCart application.

**IMPORTANT:** Requires `@anthropic-ai/sdk` version **>= 0.67.0**

### Production Models

#### Claude Sonnet 4.5 (Primary Model)
**Model ID:** `claude-sonnet-4-5-20250929` (or `claude-sonnet-4-5` for auto-updates)

**Use Cases:**
- AI Shopping Assistant (agents/shoppingAssistant.ts)
- Complex reasoning and analysis
- Multi-turn conversations with tool use
- Budget calculations and recommendations
- Shopping list optimization
- Meal planning suggestions

**Capabilities:**
- Extended thinking mode for complex problems
- Tool/function calling
- Vision API (for grocery receipt/product scanning)
- Multi-turn conversations
- JSON mode for structured outputs

**Performance:**
- High accuracy for complex tasks
- Best for user-facing AI interactions
- Recommended for all primary assistant features

**Configuration:**
```typescript
const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  temperature: 1.0,
  // Add thinking for complex reasoning:
  // thinking: {
  //   type: 'enabled',
  //   budget_tokens: 10000
  // }
});
```

---

#### Claude Haiku 4.5 (Fast Tasks)
**Model ID:** `claude-haiku-4-5-20251001` (or `claude-haiku-4-5` for auto-updates)

**Use Cases:**
- Quick lookups and simple queries
- Data validation
- Simple categorization
- Lightweight API endpoints
- Background processing tasks

**Capabilities:**
- Ultra-fast response times
- Cost-effective for high-volume requests
- Good for simple reasoning tasks
- Still supports tool calling

**Performance:**
- Optimized for speed and cost
- Use for non-critical, straightforward tasks
- Ideal for high-frequency operations

**Configuration:**
```typescript
const response = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 1024,
  temperature: 1.0,
});
```

---

### Model Selection Guidelines

**Use Sonnet 4.5 when:**
- User is directly interacting with AI
- Complex reasoning or analysis required
- Multi-step tool execution needed
- Vision capabilities required (scanning receipts/products)
- Budget optimization recommendations
- Meal planning with multiple constraints

**Use Haiku 4.5 when:**
- Simple data lookups
- Quick validation checks
- Background data processing
- High-frequency API calls
- Cost optimization is priority

---

### SDK Version Requirements

**CRITICAL:** You MUST use `@anthropic-ai/sdk` version **0.67.0 or higher** for Sonnet 4.5 and Haiku 4.5 models.

**Old SDK versions (< 0.67.0) will result in 404 errors** with the new model IDs.

```bash
# Check your SDK version
npm list @anthropic-ai/sdk

# Update to latest
npm install @anthropic-ai/sdk@latest
```

**Current version in project:** `0.67.0` ✅

---

### Deprecated Models

The following models should NOT be used:

- ❌ `claude-3-5-sonnet-20241022` (Use claude-sonnet-4-5-20250929 instead)
- ❌ `claude-3-opus-*` (Superseded by Sonnet 4.5)
- ❌ `claude-3-sonnet-*` (Superseded by Sonnet 4.5)
- ❌ `claude-3-haiku-*` (Superseded by Haiku 4.5)

**Common Error:**
```
Error: 404 {"type":"error","error":{"type":"not_found_error","message":"model: claude-3-5-sonnet-20241022"}}
```

**Solutions:**
1. Update SDK to >= 0.67.0
2. Use claude-sonnet-4-5-20250929 or claude-sonnet-4-5
3. Ensure Railway has latest package.json/package-lock.json

---

### Future Features

#### Vision API Integration (Phase 3)
**Purpose:** Upload photos of groceries, receipts, and pantry items

**Capabilities:**
- Receipt scanning and parsing
- Product identification from photos
- Pantry inventory via camera
- Price verification from shelf labels

**Implementation Example:**
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
          text: 'Extract all items and prices from this grocery receipt',
        },
      ],
    },
  ],
});
```

---

### Environment Configuration

**Required Environment Variables:**
```bash
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Railway Deployment:**
1. Set `VITE_ANTHROPIC_API_KEY` in Railway environment variables
2. Model selection is automatic based on use case
3. No API key should be stored in code or UI

---

### Version History

| Date | Model | Action | Reason |
|------|-------|--------|---------|
| 2025-10-21 | claude-sonnet-4-5-20250929 | Added | Primary model for AI Assistant |
| 2025-10-21 | claude-haiku-4-5-20250229 | Added | Fast tasks and cost optimization |
| 2025-10-21 | claude-3-5-sonnet-20241022 | Removed | Model not found (404 error) |

---

### Cost Optimization

**Estimated Costs per Request:**

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Typical Request Cost |
|-------|----------------------|----------------------|---------------------|
| Sonnet 4.5 | $3.00 | $15.00 | $0.05-0.15 |
| Haiku 4.5 | $0.25 | $1.25 | $0.001-0.01 |

**Budget Management:**
- Use Haiku 4.5 for 80% of simple queries
- Reserve Sonnet 4.5 for complex AI interactions
- Implement caching for repeated queries
- Monitor usage via Anthropic Console

---

### Support

**Documentation:**
- [Anthropic API Documentation](https://docs.anthropic.com)
- [Model Comparison](https://docs.anthropic.com/claude/docs/models-overview)

**Issues:**
- If model returns 404: Check this document for approved model IDs
- If API key issues: Verify VITE_ANTHROPIC_API_KEY in Railway
- For cost concerns: Review model selection guidelines above
