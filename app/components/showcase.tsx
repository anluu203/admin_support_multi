"use client";

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  DataTable,
  DatePicker,
  Divider,
  Dropdown,
  EmptyState,
  FileUpload,
  FormField,
  Header,
  IconButton,
  Input,
  InputWithIcon,
  Label,
  Modal,
  Pagination,
  Radio,
  SearchInput,
  Select,
  Sidebar,
  Space,
  Spinner,
  Switch,
  Table,
  Tabs,
  Text,
  Textarea,
  Tooltip,
} from "@/app/components";
import {
  Home,
  Mail,
  Settings,
  Trash,
  Users,
} from "lucide-react";
import { useState } from "react";

/**
 * ComponentShowcase - Trang demo tất cả components
 */
export default function ComponentShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("atoms");
  const [currentPage, setCurrentPage] = useState(1);
  const [checked, setChecked] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState("option1");

  // Sample data for table
  const tableData = [
    { id: 1, name: "Nguyễn Văn A", email: "a@example.com", role: "Admin" },
    { id: 2, name: "Trần Thị B", email: "b@example.com", role: "User" },
    { id: 3, name: "Lê Văn C", email: "c@example.com", role: "User" },
  ];

  const tableColumns = [
    { key: "name", header: "Tên", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "role", header: "Vai trò" },
    {
      key: "actions",
      header: "Hành động",
      render: () => (
        <IconButton
          icon={Trash}
          variant="danger"
          size="sm"
          aria-label="Xóa"
        />
      ),
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        items={[
          { id: "home", label: "Trang chủ", icon: Home, href: "#" },
          {
            id: "users",
            label: "Người dùng",
            icon: Users,
            href: "#",
            badge: 5,
          },
          { id: "settings", label: "Cài đặt", icon: Settings, href: "#" },
        ]}
        activeItem="home"
        logo={<Text weight="bold">Admin Panel</Text>}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <Header
          title="Component Showcase"
          user={{
            name: "John Doe",
            email: "john@example.com",
          }}
          userMenuActions={[
            { id: "profile", label: "Hồ sơ", onClick: () => {} },
            { id: "logout", label: "Đăng xuất", onClick: () => {} },
          ]}
          notificationCount={3}
          onNotificationClick={() => {}}
        />

        {/* Content */}
        <main className="p-6">
          <div className="space-y-8">
            {/* Tabs */}
            <Tabs
              items={[
                { id: "atoms", label: "Atoms" },
                { id: "molecules", label: "Molecules" },
                { id: "organisms", label: "Organisms" },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {/* ATOMS */}
            {activeTab === "atoms" && (
              <div className="space-y-6">
                <Card title="Typography & Buttons" padding="lg">
                  <div className="space-y-4">
                    <div>
                      <Label>Text Sizes</Label>
                      <Space height={2} />
                      <div className="space-y-2">
                        <Text size="xxs">Extra Extra Small Text</Text>
                        <Text size="xs">Extra Small Text</Text>
                        <Text size="sm">Small Text</Text>
                        <Text size="md">Medium Text</Text>
                        <Text size="lg">Large Text</Text>
                        <Text size="xl">Extra Large Text</Text>
                        <Text size="2xl">2X Large Text</Text>
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <Label>Buttons</Label>
                      <Space height={2} />
                      <div className="flex flex-wrap gap-2">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="link">Link</Button>
                        <Button variant="danger">Danger</Button>
                        <Button variant="primary" isLoading>
                          Loading
                        </Button>
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <Label>Badges</Label>
                      <Space height={2} />
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="error">Error</Badge>
                        <Badge variant="info">Info</Badge>
                        <Badge variant="default">Default</Badge>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="Form Elements" padding="lg">
                  <div className="space-y-4">
                    <FormField label="Email" htmlFor="email" required>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                      />
                    </FormField>

                    <FormField label="Mô tả">
                      <Textarea rows={3} placeholder="Nhập mô tả..." />
                    </FormField>

                    <div className="space-y-2">
                      <Checkbox
                        label="Tôi đồng ý với điều khoản"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                      />
                      <Switch
                        label="Kích hoạt thông báo"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Radio
                        name="option"
                        value="option1"
                        label="Option 1"
                        checked={selectedRadio === "option1"}
                        onChange={(e) => setSelectedRadio(e.target.value)}
                      />
                      <Radio
                        name="option"
                        value="option2"
                        label="Option 2"
                        checked={selectedRadio === "option2"}
                        onChange={(e) => setSelectedRadio(e.target.value)}
                      />
                    </div>
                  </div>
                </Card>

                <Card title="Others" padding="lg">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar src="/avatar.jpg" alt="User" size="sm" />
                      <Avatar fallback="AB" size="md" />
                      <Avatar fallback="CD" size="lg" />
                      <Spinner size="md" />
                    </div>

                    <Divider />

                    <Alert variant="success" title="Thành công">
                      Dữ liệu đã được lưu thành công!
                    </Alert>
                    <Alert variant="error" title="Lỗi">
                      Có lỗi xảy ra khi xử lý yêu cầu.
                    </Alert>
                  </div>
                </Card>
              </div>
            )}

            {/* MOLECULES */}
            {activeTab === "molecules" && (
              <div className="space-y-6">
                <Card title="Search & Select" padding="lg">
                  <div className="space-y-4">
                    <div>
                      <Label>Search Input</Label>
                      <Space height={2} />
                      <SearchInput placeholder="Tìm kiếm..." />
                    </div>

                    <div>
                      <Label>Input with Icon</Label>
                      <Space height={2} />
                      <InputWithIcon
                        icon={Mail}
                        placeholder="Email..."
                      />
                    </div>

                    <div>
                      <Label>Select</Label>
                      <Space height={2} />
                      <Select
                        options={[
                          { value: "1", label: "Option 1" },
                          { value: "2", label: "Option 2" },
                          { value: "3", label: "Option 3" },
                        ]}
                        placeholder="Chọn option"
                      />
                    </div>

                    <div>
                      <Label>Date Picker</Label>
                      <Space height={2} />
                      <DatePicker />
                    </div>
                  </div>
                </Card>

                <Card title="Interactive Elements" padding="lg">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button onClick={() => setModalOpen(true)}>
                        Mở Modal
                      </Button>
                      <Button onClick={() => setConfirmOpen(true)}>
                        Mở Confirm Dialog
                      </Button>
                    </div>

                    <Divider />

                    <div className="flex gap-2">
                      <Dropdown
                        trigger={<Button variant="outline">Dropdown</Button>}
                        items={[
                          {
                            id: "edit",
                            label: "Sửa",
                            icon: <Settings className="h-4 w-4" />,
                            onClick: () => {},
                          },
                          {
                            id: "delete",
                            label: "Xóa",
                            icon: <Trash className="h-4 w-4" />,
                            onClick: () => {},
                          },
                        ]}
                      />

                      <Tooltip content="Tooltip text">
                        <Button variant="ghost">Hover me</Button>
                      </Tooltip>
                    </div>

                    <Divider />

                    <Pagination
                      currentPage={currentPage}
                      totalPages={10}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </Card>

                <Card title="File Upload" padding="lg">
                  <FileUpload
                    accept="image/*"
                    showPreview
                    onFileSelect={(files) => console.log(files)}
                  />
                </Card>

                <EmptyState
                  title="Không có dữ liệu"
                  description="Chưa có dữ liệu để hiển thị"
                  action={<Button>Thêm mới</Button>}
                />
              </div>
            )}

            {/* ORGANISMS */}
            {activeTab === "organisms" && (
              <div className="space-y-6">
                <Card title="Basic Table" padding="lg">
                  <Table columns={tableColumns} data={tableData} />
                </Card>

                <Card title="Data Table (với Search & Pagination)" padding="lg">
                  <DataTable
                    columns={tableColumns}
                    data={tableData}
                    showSearch
                    showPagination
                    totalItems={30}
                    pageSize={10}
                  />
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Demo Modal"
      >
        <Text>Đây là nội dung modal</Text>
        <Space height={4} />
        <Button onClick={() => setModalOpen(false)} fullWidth>
          Đóng
        </Button>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          console.log("Confirmed");
          setConfirmOpen(false);
        }}
        title="Xác nhận"
        message="Bạn có chắc muốn thực hiện hành động này?"
        variant="danger"
      />
    </div>
  );
}
