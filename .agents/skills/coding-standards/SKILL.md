---
name: coding-standards
description: Baseline cross-project coding conventions for naming, readability, immutability, and code-quality review. Use when reviewing code quality or naming, starting a module, or enforcing structural consistency.
license: MIT
---

# Coding Standards & Best Practices

Baseline coding conventions applicable across projects.

This skill is the shared floor, not a framework playbook. Source comments follow root `AGENTS.md` (no comments or JSDoc in source).

## When to Activate

- Starting a new project or module
- Reviewing code for quality and maintainability
- Refactoring existing code to follow conventions
- Enforcing naming, formatting, or structural consistency
- Setting up linting, formatting, or type-checking rules
- Onboarding new contributors to coding conventions

## Scope Boundaries

Activate this skill for:
- descriptive naming
- immutability defaults
- readability, KISS, DRY, and YAGNI enforcement
- error-handling expectations and code-smell review

Do not use this skill as the primary source for:
- React composition, hooks, or rendering patterns as a product architecture
- backend architecture or database layering (see Arc42 and ADRs)
- REST contracts (see `.agents/skills/api-design/SKILL.md`)
- auth, input, secrets, or sensitive features (see `.agents/skills/security-review/SKILL.md`)
- package managers, linters, and formatters (see "Tooling (mandatory)" in root `AGENTS.md`: pnpm + oxlint, uv + ruff)

## Code Quality Principles

### 1. Readability First
- Code is read more than written
- Clear variable and function names
- Names, structure, and tests must make intent obvious
- Consistent formatting

### 2. KISS (Keep It Simple, Stupid)
- Simplest solution that works
- Avoid over-engineering
- No premature optimization
- Easy to understand > clever code

### 3. DRY (Don't Repeat Yourself)
- Extract common logic into functions
- Create reusable components
- Share utilities across modules
- Avoid copy-paste programming

### 4. YAGNI (You Aren't Gonna Need It)
- Don't build features before they're needed
- Avoid speculative generality
- Add complexity only when required
- Start simple, refactor when needed

## TypeScript/JavaScript Standards

### Variable Naming

```typescript
const marketSearchQuery = 'election'
const isUserAuthenticated = true
const totalRevenue = 1000

const q = 'election'
const flag = true
const x = 1000
```

PASS: descriptive names. FAIL: unclear names.

### Function Naming

```typescript
async function fetchMarketData(marketId: string) { }
function calculateSimilarity(a: number[], b: number[]) { }
function isValidEmail(email: string): boolean { }

async function market(id: string) { }
function similarity(a, b) { }
function email(e) { }
```

PASS: verb-noun. FAIL: unclear or noun-only.

### Immutability Pattern (CRITICAL)

```typescript
const updatedUser = {
  ...user,
  name: 'New Name'
}

const updatedArray = [...items, newItem]

user.name = 'New Name'
items.push(newItem)
```

PASS: spread. FAIL: mutate in place.

### Error Handling

```typescript
async function fetchData(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}

async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}
```

PASS: handle failure. FAIL: ignore it.

### Async/Await Best Practices

```typescript
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
])

const users = await fetchUsers()
const markets = await fetchMarkets()
const stats = await fetchStats()
```

PASS: parallel when independent. FAIL: sequential without a reason.

### Type Safety

```typescript
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
  created_at: Date
}

function getMarket(id: string): Promise<Market> {
}

function getMarket(id: any): Promise<any> {
}
```

PASS: real types. FAIL: `any`.

## React Best Practices

### Component Structure

```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

PASS: typed functional component. FAIL: untyped props bag.

### Custom Hooks

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

const debouncedQuery = useDebounce(searchQuery, 500)
```

### State Management

```typescript
const [count, setCount] = useState(0)

setCount(prev => prev + 1)

setCount(count + 1)
```

PASS: functional update when next state depends on previous. FAIL: stale closure risk.

### Conditional Rendering

```typescript
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

{isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}
```

PASS: separate conditions. FAIL: nested ternaries.

## API Design Standards

### REST API Conventions

```
GET    /api/markets
GET    /api/markets/:id
POST   /api/markets
PUT    /api/markets/:id
PATCH  /api/markets/:id
DELETE /api/markets/:id

GET /api/markets?status=active&limit=10&offset=0
```

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

return NextResponse.json({
  success: true,
  data: markets,
  meta: { total: 100, page: 1, limit: 10 }
})

return NextResponse.json({
  success: false,
  error: 'Invalid request'
}, { status: 400 })
```

### Input Validation

```typescript
import { z } from 'zod'

const CreateMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime(),
  categories: z.array(z.string()).min(1)
})

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const validated = CreateMarketSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
  }
}
```

## File Organization

### Project Structure

```
src/
├── app/
│   ├── api/
│   ├── markets/
│   └── (auth)/
├── components/
│   ├── ui/
│   ├── forms/
│   └── layouts/
├── hooks/
├── lib/
│   ├── api/
│   ├── utils/
│   └── constants/
├── types/
└── styles/
```

This layout is an example when the project uses Next.js. An accepted ADR or Arc42 building-block view wins if it disagrees.

### File Naming

```
components/Button.tsx
hooks/useAuth.ts
lib/formatDate.ts
types/market.types.ts
```

PascalCase for components. camelCase with `use` prefix for hooks. camelCase for utilities. `.types` suffix for type modules.

## Comments

Do not add comments or JSDoc in source. See root `AGENTS.md`.

## Performance Best Practices

### Memoization

```typescript
import { useMemo, useCallback } from 'react'

const sortedMarkets = useMemo(() => {
  return [...markets].sort((a, b) => b.volume - a.volume)
}, [markets])

const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])
```

Copy before sorting. `Array.prototype.sort` mutates in place.

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  )
}
```

### Database Queries

```typescript
const { data } = await supabase
  .from('markets')
  .select('id, name, status')
  .limit(10)

const { data } = await supabase
  .from('markets')
  .select('*')
```

PASS: select needed columns. FAIL: select everything.

## Testing Standards

### Test Structure (AAA Pattern)

```typescript
test('calculates similarity correctly', () => {
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  const similarity = calculateCosineSimilarity(vector1, vector2)

  expect(similarity).toBe(0)
})
```

Arrange, act, assert.

### Test Naming

```typescript
test('returns empty array when no markets match query', () => { })
test('throws error when OpenAI API key is missing', () => { })
test('falls back to substring search when Redis unavailable', () => { })

test('works', () => { })
test('test search', () => { })
```

PASS: names state the behavior. FAIL: vague names.

## Code Smell Detection

### 1. Long Functions

```typescript
function processMarketData() {
}

function processMarketData() {
  const validated = validateData()
  const transformed = transformData(validated)
  return saveData(transformed)
}
```

FAIL: one function over ~50 lines. PASS: split by responsibility.

### 2. Deep Nesting

```typescript
if (user) {
  if (user.isAdmin) {
    if (market) {
      if (market.isActive) {
        if (hasPermission) {
        }
      }
    }
  }
}

if (!user) return
if (!user.isAdmin) return
if (!market) return
if (!market.isActive) return
if (!hasPermission) return
```

FAIL: nested guards. PASS: early returns.

### 3. Magic Numbers

```typescript
if (retryCount > 3) { }
setTimeout(callback, 500)

const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS)
```

FAIL: unexplained numbers. PASS: named constants.
