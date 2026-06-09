import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Flex, Input, Tag, Skeleton } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { VendorCard } from '../../components/VendorCard/VendorCard';
import { getPriorityTagProps } from '../../utils/priorityConfig';
import { getStatusTagProps } from '../../utils/statusConfig';
import type { Task, TaskStatus, Vendor } from '../../types';
import { fetchTaskById, updateTask } from '../../lib/firestore/tasks';
import { fetchVendors, addVendor, selectVendor } from '../../lib/firestore/vendors';
import { useAppSelector } from '../../store';
import { selectAuthUid } from '../../features/auth/authSlice';
import styles from './TaskDetail.module.scss';

interface TaskDetailVendorProps {
  taskId: string;
}

const STATUS_OPTIONS: TaskStatus[] = ['notStarted', 'inProgress', 'closed'];

export function TaskDetailVendor({ taskId }: TaskDetailVendorProps) {
  const { t } = useTranslation('tasks');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const coupleId = useAppSelector(selectAuthUid) ?? '';
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    name: '',
    phone: '',
    email: '',
    priceMin: '',
    priceMax: '',
    rating: 0,
    notes: '',
  });

  const { data: task, isLoading: taskLoading } = useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: () => fetchTaskById(taskId),
    enabled: Boolean(taskId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['vendors', taskId],
    queryFn: () => fetchVendors(taskId),
    enabled: Boolean(taskId),
    staleTime: 5 * 60 * 1000,
  });

  const updateTaskMutation = useMutation({
    mutationFn: (updates: Partial<Pick<Task, 'status' | 'notes'>>) =>
      updateTask(taskId, updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', coupleId] });
    },
  });

  const addVendorMutation = useMutation({
    mutationFn: (data: Omit<Vendor, 'id' | 'status'>) => addVendor(coupleId, taskId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vendors', taskId] });
      setShowAddVendor(false);
      setVendorForm({ name: '', phone: '', email: '', priceMin: '', priceMax: '', rating: 0, notes: '' });
    },
  });

  const selectVendorMutation = useMutation({
    mutationFn: (vendorId: string) => selectVendor(coupleId, taskId, vendorId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vendors', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', coupleId] });
    },
  });

  const isLoading = taskLoading || vendorsLoading;

  if (isLoading || !task) {
    return (
      <Flex vertical className={styles.page} data-testid="task-detail-vendor-skeleton">
        <PageHeader title="..." onBack={() => navigate('/tasks')} />
        <div style={{ padding: '24px 20px' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </Flex>
    );
  }

  const priorityProps = getPriorityTagProps(task.priority);
  const statusProps = getStatusTagProps(task.status);

  function handleAddVendorSave() {
    if (!vendorForm.name.trim()) return;
    addVendorMutation.mutate({
      name: vendorForm.name.trim(),
      phone: vendorForm.phone.trim() || undefined,
      email: vendorForm.email.trim() || undefined,
      priceMin: vendorForm.priceMin ? Number(vendorForm.priceMin) : undefined,
      priceMax: vendorForm.priceMax ? Number(vendorForm.priceMax) : undefined,
      rating: vendorForm.rating || undefined,
      notes: vendorForm.notes.trim() || undefined,
    });
  }

  return (
    <Flex vertical className={styles.page} data-testid="task-detail-vendor-page">
      <PageHeader title={task.name} onBack={() => navigate('/tasks')} />

      <Flex vertical gap={20} className={styles.content}>
        <div className={styles.desktopTitle}>{task.name}</div>

        {/* ── Status + Priority ─────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('detail.statusLabel')}</div>

          {/* Status selector */}
          <Flex wrap gap={8} justify="flex-end" data-testid="task-status-selector">
            {STATUS_OPTIONS.map((status) => {
              const sp = getStatusTagProps(status);
              const isActive = task.status === status;
              return (
                <button
                  key={status}
                  type="button"
                  className={`${styles.statusChip}${isActive ? ` ${styles.statusChipActive}` : ''}`}
                  style={isActive ? { background: sp.color === 'default' ? '#e8e8e8' : sp.color, borderColor: sp.color === 'default' ? '#bbb' : sp.color, ...sp.style } : {}}
                  onClick={() => updateTaskMutation.mutate({ status })}
                  data-testid={`status-chip-${status}`}
                  aria-pressed={isActive}
                >
                  {sp.label}
                </button>
              );
            })}
          </Flex>

          {/* Priority + responsible row */}
          <Flex justify="flex-end" gap={8} style={{ marginTop: 12 }}>
            <Tag
              color={priorityProps.color}
              style={priorityProps.style}
              data-testid="task-priority-badge"
            >
              {priorityProps.label}
            </Tag>
            {task.responsible && (
              <Tag data-testid="task-responsible">
                {task.responsible === 'partner1'
                  ? t('responsible.partner1')
                  : task.responsible === 'partner2'
                    ? t('responsible.partner2')
                    : t('responsible.both')}
              </Tag>
            )}
          </Flex>
        </div>

        {/* ── Vendor list ───────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('detail.vendor.vendorsTitle')}</div>

          {vendors.length === 0 && !showAddVendor ? (
            <div
              style={{
                textAlign: 'center',
                color: '#9e9e9e',
                fontFamily: 'Rubik',
                fontSize: 14,
                padding: '12px 0',
              }}
              data-testid="no-vendors-message"
            >
              {t('detail.vendor.noVendors')}
            </div>
          ) : (
            <Flex vertical gap={12}>
              {vendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onSelect={(v) => selectVendorMutation.mutate(v.id)}
                  onEdit={() => {}} // edit in-place via card — future enhancement
                />
              ))}
            </Flex>
          )}

          {/* Add vendor inline form */}
          {showAddVendor && (
            <Flex
              vertical
              gap={10}
              style={{
                background: '#f9f5ef',
                borderRadius: 12,
                padding: 16,
                marginTop: 12,
              }}
              data-testid="add-vendor-form"
            >
              <Input
                placeholder="שם הספק"
                value={vendorForm.name}
                onChange={(e) => setVendorForm((p) => ({ ...p, name: e.target.value }))}
                size="large"
                data-testid="vendor-name-input"
              />
              <Flex gap={8}>
                <Input
                  placeholder="מחיר מינ׳"
                  value={vendorForm.priceMin}
                  onChange={(e) => setVendorForm((p) => ({ ...p, priceMin: e.target.value }))}
                  type="number"
                  data-testid="vendor-price-min"
                />
                <Input
                  placeholder="מחיר מקס׳"
                  value={vendorForm.priceMax}
                  onChange={(e) => setVendorForm((p) => ({ ...p, priceMax: e.target.value }))}
                  type="number"
                  data-testid="vendor-price-max"
                />
              </Flex>
              <Input
                placeholder="טלפון"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm((p) => ({ ...p, phone: e.target.value }))}
                data-testid="vendor-phone-input"
              />
              <Flex gap={8} justify="flex-start">
                <Button
                  type="primary"
                  onClick={handleAddVendorSave}
                  disabled={!vendorForm.name.trim() || addVendorMutation.isPending}
                  loading={addVendorMutation.isPending}
                  style={{ backgroundColor: '#C9A97A', borderColor: '#C9A97A' }}
                  data-testid="vendor-save-btn"
                >
                  הוסף
                </Button>
                <Button onClick={() => setShowAddVendor(false)} data-testid="vendor-cancel-btn">
                  ביטול
                </Button>
              </Flex>
            </Flex>
          )}

          {/* Dashed "add vendor" card */}
          {!showAddVendor && (
            <button
              type="button"
              className={styles.dashedCard}
              onClick={() => setShowAddVendor(true)}
              data-testid="add-vendor-dashed-card"
              style={{ marginTop: vendors.length > 0 ? 12 : 0 }}
            >
              {t('detail.vendor.addVendor')}
            </button>
          )}
        </div>

        {/* ── Notes ────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t('detail.notesLabel')}</div>
          <Input.TextArea
            value={task.notes ?? ''}
            onChange={(e) => updateTaskMutation.mutate({ notes: e.target.value })}
            placeholder={t('detail.notesPlaceholder')}
            rows={3}
            data-testid="task-notes"
          />
        </div>

        {/* ── Status display ───────────────────────────── */}
        <Flex justify="flex-end">
          <Tag color={statusProps.color} style={{ ...statusProps.style, fontSize: 14, padding: '4px 12px' }}>
            {statusProps.label}
          </Tag>
        </Flex>
      </Flex>
    </Flex>
  );
}
