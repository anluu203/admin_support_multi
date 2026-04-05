# Base Components Library

Bộ components tái sử dụng cho dự án admin quản lý, được xây dựng theo **Atomic Design** với Next.js 15 + React 19 + Tailwind CSS 4.

## 📦 Cấu trúc

```
app/components/
├── atoms/          # Components cơ bản
├── molecules/      # Components kết hợp
├── organisms/      # Components phức tạp
└── index.ts        # Export tất cả
```

## 🎨 Design System

### Theme Colors

- **Primary**: `bg-primary`, `text-primary`
- **Secondary**: `bg-secondary`, `text-secondary`
- **Success**: `bg-success`, `text-success`
- **Warning**: `bg-warning`, `text-warning`
- **Error**: `bg-error`, `text-error`
- **Info**: `bg-info`, `text-info`

### Typography

- **Sizes**: `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
- **Weights**: `normal`, `medium`, `bold`

## 🚀 Cách sử dụng

### Import Components

```tsx
// Import từ atoms
import { Text, Button, Input } from "@/app/components/atoms";

// Import từ molecules
import { Card, Modal, FormField } from "@/app/components/molecules";

// Import từ organisms
import { Table, Sidebar, Header } from "@/app/components/organisms";

// Hoặc import tất cả
import { Text, Button, Card, Table } from "@/app/components";
```

## 📚 ATOMS

### Text

```tsx
<Text size="lg" weight="bold" color="primary">
  Tiêu đề
</Text>
```

### Button

```tsx
<Button variant="primary" isLoading={isLoading}>
  Lưu
</Button>

<Button variant="outline">
  Hủy
</Button>

<Button variant="link">
  Xem thêm
</Button>
```

### Input

```tsx
<Input
  type="email"
  placeholder="Email của bạn"
  error={errors.email}
/>
```

### Badge

```tsx
<Badge variant="success">Hoàn thành</Badge>
<Badge variant="error">Lỗi</Badge>
```

### Alert

```tsx
<Alert variant="success" title="Thành công">
  Dữ liệu đã được lưu!
</Alert>
```

## 📚 MOLECULES

### Card

```tsx
<Card
  title="Thông tin người dùng"
  description="Chi tiết"
  footer={<Button>Lưu</Button>}
>
  <p>Nội dung...</p>
</Card>
```

### Modal

```tsx
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Xác nhận"
>
  <p>Nội dung modal</p>
</Modal>
```

### FormField

```tsx
<FormField
  label="Email"
  htmlFor="email"
  error={errors.email}
  required
>
  <Input id="email" type="email" />
</FormField>
```

### Tabs

```tsx
<Tabs
  items={[
    { id: 'info', label: 'Thông tin' },
    { id: 'settings', label: 'Cài đặt' },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

### Pagination

```tsx
<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
/>
```

## 📚 ORGANISMS

### Table

```tsx
<Table
  columns={[
    { key: 'name', header: 'Tên', sortable: true },
    { key: 'email', header: 'Email' },
    {
      key: 'actions',
      header: 'Hành động',
      render: (item) => (
        <Button size="sm">Sửa</Button>
      ),
    },
  ]}
  data={users}
  loading={isLoading}
  onSort={(key, direction) => handleSort(key, direction)}
/>
```

### DataTable (Table + Search + Pagination)

```tsx
<DataTable
  columns={columns}
  data={users}
  showSearch
  showPagination
  onSearch={(query) => setSearchQuery(query)}
  totalItems={100}
  pageSize={10}
/>
```

### Sidebar

```tsx
<Sidebar
  items={[
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'users', label: 'Users', icon: Users, href: '/users', badge: 5 },
  ]}
  activeItem="dashboard"
  logo={<img src="/logo.png" alt="Logo" />}
/>
```

### Header

```tsx
<Header
  title="Dashboard"
  user={{
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatar.jpg',
  }}
  userMenuActions={[
    { id: 'profile', label: 'Hồ sơ', onClick: () => {} },
    { id: 'logout', label: 'Đăng xuất', onClick: () => {} },
  ]}
  notificationCount={3}
  onNotificationClick={() => {}}
/>
```

### ErrorDisplay

```tsx
// Với Result type từ API
if (isError(result)) {
  return (
    <ErrorDisplay
      error={result.error}
      onRetry={refetch}
    />
  );
}
```

### ConfirmDialog

```tsx
<ConfirmDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Xác nhận xóa"
  message="Bạn có chắc muốn xóa người dùng này?"
  variant="danger"
/>
```

## 🎯 Best Practices

### 1. Server Component First

```tsx
// ✅ Server Component (mặc định)
export default async function UsersPage() {
  const users = await fetchUsers();
  return <UserList users={users} />;
}

// ❌ Không cần 'use client' nếu không cần events/state
```

### 2. Container/Presentational Pattern

```tsx
// container.tsx - Xử lý data
export default async function UserContainer() {
  const result = await fetchUsers();
  if (isError(result)) {
    return <ErrorDisplay error={result.error} />;
  }
  return <UserPresentational users={result.data} />;
}

// presentational.tsx - Hiển thị UI
"use client";
export function UserPresentational({ users }) {
  return <Table columns={columns} data={users} />;
}
```

### 3. Error Handling

```tsx
// ✅ Dùng Result type
const result = await fetchUsers();
if (isError(result)) {
  return <ErrorDisplay error={result.error} />;
}

// ❌ Không throw exceptions
```

### 4. Styling

```tsx
// ✅ Dùng theme variables
<div className="bg-primary text-text-surface" />

// ✅ Dùng cn() để merge classes
<div className={cn("base-class", isActive && "active")} />

// ❌ Không dùng px
<div className="w-[40px]" /> // ❌
<div className="w-10" />     // ✅
```

## 📝 Checklist khi tạo component mới

- [ ] Đặt tên theo PascalCase
- [ ] Viết JSDoc đầy đủ
- [ ] Định nghĩa TypeScript types rõ ràng
- [ ] Thêm `data-testid` prop
- [ ] Dùng theme variables
- [ ] Dùng `cn()` để merge className
- [ ] Không dùng px units
- [ ] Export trong file index.ts

## 🔗 Tài liệu tham khảo

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
