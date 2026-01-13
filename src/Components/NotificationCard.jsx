import React, { useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchNotification, resetNotificationCard } from '../redux/slices/notificationCardSlice';
import { RichEditor } from 'react-native-pell-rich-editor';

const { width } = Dimensions.get('window');

const formatDate = (rawDate) => {
  if (!rawDate) return 'Today';

  const parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) return rawDate;

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const htmlEncode = (text = '') =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildRichHtml = (content = '') => {
  const trimmed = (content || '').trim();
  if (!trimmed) {
    return '<p>No notification content available.</p>';
  }

  const hasHtmlTags = /<\/?[a-z][\s\S]*?>/i.test(trimmed);
  if (hasHtmlTags) {
    return trimmed;
  }

  const normalized = htmlEncode(trimmed).replace(/\r\n/g, '\n');
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n+/g, ' ').trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return '<p>No notification content available.</p>';
  }

  const [firstParagraph, ...restParagraphs] = paragraphs;

  const htmlParagraphs = [
    `<p class="highlight-paragraph">${firstParagraph}</p>`,
    ...restParagraphs.map((paragraph) => `<p>${paragraph}</p>`),
  ].join('');

  return `<div>${htmlParagraphs}</div>`;
};

export default function NotificationCard({ notification, onBack, notificationId }) {
  const dispatch = useDispatch();
  const { loading, error, notification: apiNotification, success } = useSelector(
    (state) => state.notificationCard
  );
  const richEditorRef = useRef(null);

  console.log('[NOTIFICATION_CARD] Component rendered with props:', {
    hasNotification: !!notification,
    notificationId,
    loading,
    hasApiNotification: !!apiNotification,
  });

  useEffect(() => {
    console.log('[NOTIFICATION_CARD] useEffect triggered');
    const idToFetch = notificationId || notification?.n_id;
    
    if (idToFetch) {
      console.log('[NOTIFICATION_CARD] Fetching notification with ID:', idToFetch);
      dispatch(fetchNotification(idToFetch));
    } else {
      console.log('[NOTIFICATION_CARD] No ID provided, fetching all notifications');
      dispatch(fetchNotification(null));
    }

    return () => {
      console.log('[NOTIFICATION_CARD] Component unmounting, resetting state');
      dispatch(resetNotificationCard());
    };
  }, [dispatch, notificationId, notification?.n_id]);

  // Ensure editor is always blurred and non-interactive
  useEffect(() => {
    if (richEditorRef.current && displayNotification) {
      const timer = setTimeout(() => {
        if (richEditorRef.current) {
          richEditorRef.current.blurContentEditor();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [displayNotification]);

  const handleRefresh = () => {
    console.log('[NOTIFICATION_CARD] Manual refresh triggered');
    const idToFetch = notificationId || notification?.n_id;
    dispatch(fetchNotification(idToFetch || null));
  };

  // Use API notification if available, otherwise fallback to prop notification
  const displayNotification = apiNotification || notification;

  const cardContent = useMemo(() => {
    const fallback = {
      n_subject: 'No Notification',
      n_date: new Date().toISOString(),
      n_description: 'No notification content available.',
    };

    return {
      title: displayNotification?.n_subject || fallback.n_subject,
      date: displayNotification?.n_date || fallback.n_date,
      description: displayNotification?.n_description || fallback.n_description,
    };
  }, [displayNotification]);

  const richDescriptionHtml = useMemo(
    () => buildRichHtml(cardContent.description),
    [cardContent.description]
  );

  // Loading State
  if (loading && !displayNotification) {
    return (
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderLeft}>
            {onBack && (
              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.8}
                onPress={onBack}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={26}
                  color="#FF6B35"
                />
              </TouchableOpacity>
            )}
            <Text style={styles.pageTitle}>Notification</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading notification...</Text>
        </View>
      </View>
    );
  }

  // Error State
  if (error && !displayNotification) {
    return (
      <View style={styles.container}>
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderLeft}>
            {onBack && (
              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.8}
                onPress={onBack}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={26}
                  color="#FF6B35"
                />
              </TouchableOpacity>
            )}
            <Text style={styles.pageTitle}>Notification</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color="#EF4444"
          />
          <Text style={styles.errorTitle}>Error Loading Notification</Text>
          <Text style={styles.errorText}>
            {error?.message || 'Failed to load notification. Please try again.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
      >
        {/* ----------- Page Header ---------- */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderLeft}>
            {onBack && (
              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.8}
                onPress={onBack}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={26}
                  color="#FF6B35"
                />
              </TouchableOpacity>
            )}
            <View style={styles.titleContainer}>
              <Text style={styles.pageTitle}>Notification</Text>
              {success && (
                <View style={styles.successBadge}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={14}
                    color="#10B981"
                  />
                  <Text style={styles.successText}>Loaded</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ----------- Card ---------- */}
        <View style={styles.card}>
          <LinearGradient
            colors={['#FF6B35', '#FF8C42', '#FFA366']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.leftAccent}
          />

          <View style={styles.cardContent}>
            {/* Header Row */}
            <View style={styles.cardHeader}>
              <View style={styles.titleWrapper}>
                <MaterialCommunityIcons
                  name="bell-ring-outline"
                  size={26}
                  color="#FF6B35"
                  style={styles.titleIcon}
                />
                <Text style={styles.titleText}>{cardContent.title}</Text>
              </View>
              <View style={styles.dateBadge}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color="#FF6B35"
                />
                <Text style={styles.dateText}>
                  {formatDate(cardContent.date)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Rich description - Completely read-only, no editing for anyone */}
            <View style={styles.descriptionContainer}>
              <View 
                style={styles.descriptionTextWrapper} 
                pointerEvents="none"
                onStartShouldSetResponder={() => false}
                onMoveShouldSetResponder={() => false}
              >
                <RichEditor
                  ref={richEditorRef}
                  initialContentHTML={richDescriptionHtml}
                  useContainer={true}
                  scrollEnabled={false}
                  editable={false}
                  disabled={true}
                  initialHeight={180}
                  style={styles.richEditor}
                  containerStyle={styles.richEditorContainer}
                  onFocus={() => {
                    if (richEditorRef.current) {
                      richEditorRef.current.blurContentEditor();
                    }
                  }}
                  onCursorPosition={() => {
                    if (richEditorRef.current) {
                      richEditorRef.current.blurContentEditor();
                    }
                  }}
                  editorStyle={{
                    backgroundColor: 'transparent',
                    color: '#374151',
                    placeholderColor: '#94A3B8',
                    contentCSSText: `
                      width:100%;
                      font-size:16px;
                      line-height:28px;
                      color:#374151;
                      text-align:justify;
                      padding:0;
                      margin:0;
                      user-select:none !important;
                      -webkit-user-select:none !important;
                      -moz-user-select:none !important;
                      -ms-user-select:none !important;
                      caret-color: transparent !important;
                      pointer-events:none !important;
                      -webkit-touch-callout:none !important;
                      -webkit-tap-highlight-color:transparent !important;
                      touch-action:none !important;
                      outline:none !important;
                      -webkit-user-modify:read-only !important;
                    * {
                      user-select:none !important;
                      -webkit-user-select:none !important;
                      pointer-events:none !important;
                      -webkit-touch-callout:none !important;
                      -webkit-user-modify:read-only !important;
                    }
                    p {
                      margin-bottom: 14px;
                      user-select:none !important;
                      -webkit-user-select:none !important;
                      pointer-events:none !important;
                      -webkit-user-modify:read-only !important;
                    }
                    p:last-child {
                      margin-bottom: 0;
                    }
                    p.highlight-paragraph {
                      background-color: #FFF4C9;
                      padding: 6px 10px;
                      border-radius: 10px;
                      font-weight: 600;
                      display: inline-block;
                      width: 100%;
                      box-sizing: border-box;
                      color: #1F2937;
                      user-select:none !important;
                      -webkit-user-select:none !important;
                      pointer-events:none !important;
                      -webkit-user-modify:read-only !important;
                    }
                    strong {
                      color: #111827;
                      user-select:none !important;
                      -webkit-user-select:none !important;
                      -webkit-user-modify:read-only !important;
                    }
                    a {
                      color: #2563EB;
                      text-decoration: underline;
                      user-select:none !important;
                      -webkit-user-select:none !important;
                      pointer-events:none !important;
                      -webkit-user-modify:read-only !important;
                    }
                    div {
                      user-select:none !important;
                      -webkit-user-select:none !important;
                      pointer-events:none !important;
                      -webkit-user-modify:read-only !important;
                    }
                    `,
                  }}
                />
              </View>
            </View>

            {/* Footer decoration */}
            <View style={styles.cardFooter}>
              <View style={styles.footerLine} />
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color="#FF8C42"
              />
              <Text style={styles.footerText}>Official Notification</Text>
            </View>
          </View>
        </View>

        {/* Loading overlay when refreshing */}
        {loading && displayNotification && (
          <View style={styles.refreshOverlay}>
            <ActivityIndicator size="small" color="#FF6B35" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ----------------------------
// STYLES
// ----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6FB',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
    alignItems: 'center',
  },

  pageHeader: {
    width: '100%',
    maxWidth: 720,
    marginBottom: 24,
  },
  pageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  successText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#FF6B35',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 860,
    backgroundColor: '#fff',
    borderRadius: 28,
    flexDirection: 'row',
    elevation: 20,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.15)',
  },
  leftAccent: {
    width: 8,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 36,
  },

  cardHeader: {
    marginBottom: 20,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  titleIcon: {
    marginTop: 2,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
    lineHeight: 32,
    letterSpacing: 0.2,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FFE5D9',
    gap: 8,
    alignSelf: 'flex-start',
    shadowColor: '#FF6B35',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B35',
  },

  divider: {
    height: 2,
    backgroundColor: '#FFE5D9',
    marginBottom: 28,
    borderRadius: 1,
    marginTop: 4,
  },

  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTextWrapper: {
    flex: 1,
    width: '100%',
    // Prevent all interactions
    pointerEvents: 'none',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 30,
    color: '#374151',
    marginBottom: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  richEditorContainer: {
    minHeight: 180,
    paddingVertical: 4,
  },
  richEditor: {
    minHeight: 180,
    width: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 20,
    borderTopWidth: 1.5,
    borderTopColor: '#FFE5D9',
  },
  footerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#FFE5D9',
    borderRadius: 1,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF8C42',
    letterSpacing: 0.5,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F2D',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    shadowColor: '#FF6B35',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  // Refresh Overlay
  refreshOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
