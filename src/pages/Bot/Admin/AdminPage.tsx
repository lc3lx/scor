import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContent } from '@components/layouts/PageContent';
import { BackgroundGlow } from '@components/organisms/BackgroundGlow';
import { PageHeader } from '@components/organisms/PageHeader';
import { OptionChip } from '@components/molecules/OptionChip';
import { Button } from '@components/atoms/Button';
import { Chip } from '@components/atoms/Chip';
import { Text } from '@components/atoms/Text';
import { ROUTES } from '@constants/routes';
import { adminApi, ApiClientError, meApi, type AdminBinollaAccountDto } from '@shared/api';
import styles from './AdminPage.module.css';

type FilterStatus = 'Pending' | 'Approved' | 'Rejected';

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>('Pending');
  const [items, setItems] = useState<AdminBinollaAccountDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (status: FilterStatus) => {
      setLoading(true);
      setError(null);
      try {
        const me = await meApi.get();
        if (!me.isAdmin) {
          setError('Admin access required.');
          setItems([]);
          navigate(ROUTES.settings, { replace: true });
          return;
        }
        const response = await adminApi.listAccounts(status);
        setItems(response.items);
      } catch (err) {
        const message =
          err instanceof ApiClientError ? err.message : 'Unable to load accounts.';
        setError(message);
        setItems([]);
        if (err instanceof ApiClientError && (err.status === 403 || err.code === 'FORBIDDEN')) {
          navigate(ROUTES.settings, { replace: true });
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  const handleApprove = useCallback(
    async (id: string) => {
      setBusyId(id);
      setError(null);
      try {
        await adminApi.approve(id);
        await load(filter);
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Approve failed.');
      } finally {
        setBusyId(null);
      }
    },
    [filter, load],
  );

  const handleReject = useCallback(
    async (id: string) => {
      setBusyId(id);
      setError(null);
      try {
        await adminApi.reject(id);
        await load(filter);
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Reject failed.');
      } finally {
        setBusyId(null);
      }
    },
    [filter, load],
  );

  return (
    <main className={styles.page} aria-label="Admin approvals">
      <div className={styles.scroll}>
        <BackgroundGlow variant="top-right" />
        <PageContent className={styles.content}>
          <PageHeader title="Admin Approvals" onBack={() => navigate(-1)} />

          <Text variant="caption" tone="caption" className={styles.intro}>
            Review linked Binolla accounts. Approval grants free bot access. SSID is never shown.
          </Text>

          <div className={styles.filters} role="tablist" aria-label="Approval filter">
            {(['Pending', 'Approved', 'Rejected'] as const).map((status) => (
              <OptionChip
                key={status}
                label={status}
                selected={filter === status}
                onSelect={() => setFilter(status)}
              />
            ))}
          </div>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          {loading ? (
            <Text variant="caption" tone="caption">
              Loading…
            </Text>
          ) : items.length === 0 ? (
            <Text variant="caption" tone="caption" className={styles.empty}>
              No {filter.toLowerCase()} accounts.
            </Text>
          ) : (
            <ul className={styles.list}>
              {items.map((account) => {
                const displayName =
                  account.fullName?.trim() ||
                  (account.username ? `@${account.username.replace(/^@/, '')}` : 'User');
                const telegram = account.username
                  ? `@${account.username.replace(/^@/, '')}`
                  : String(account.telegramUserId);

                return (
                  <li key={account.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardMeta}>
                        <Text variant="body" tone="body" className={styles.name}>
                          {displayName}
                        </Text>
                        <Text variant="caption-xs" tone="caption">
                          Telegram: {telegram}
                        </Text>
                        <Text variant="caption-xs" tone="caption">
                          Binolla ID: {account.binollaAccountIdentifier ?? '—'}
                        </Text>
                        <Text variant="caption-xs" tone="caption">
                          Linked: {formatWhen(account.lastConnectedAt ?? account.createdAt)}
                        </Text>
                        {account.approvedAt ? (
                          <Text variant="caption-xs" tone="caption">
                            Decision: {formatWhen(account.approvedAt)}
                            {account.approvedBy ? ` · ${account.approvedBy}` : ''}
                          </Text>
                        ) : null}
                      </div>
                      <Chip
                        label={account.approvalStatus}
                        tone={
                          account.approvalStatus === 'Approved'
                            ? 'success'
                            : account.approvalStatus === 'Rejected'
                              ? 'danger'
                              : 'warning'
                        }
                        style="outlined"
                      />
                    </div>

                    <div className={styles.actions}>
                      {account.approvalStatus !== 'Approved' ? (
                        <Button
                          variant="primary"
                          disabled={busyId === account.id}
                          onClick={() => void handleApprove(account.id)}
                        >
                          Approve
                        </Button>
                      ) : null}
                      {account.approvalStatus !== 'Rejected' ? (
                        <Button
                          variant="ghost"
                          disabled={busyId === account.id}
                          onClick={() => void handleReject(account.id)}
                        >
                          Reject
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </PageContent>
      </div>
    </main>
  );
}
