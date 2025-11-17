interface Props {
  url: string;
  title: string;
}

const trackShare = (platform: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'social_share', {
      event_category: 'Engagement',
      event_label: platform
    });
  }
};

export default function ShareButtons({ url, title }: Props) {
  const shareText = `Check out this free Home Loan Optimizer - helps decide between prepaying vs investing! ${url}`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    color: 'white'
  };

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackShare('twitter')}
        style={{ ...buttonStyle, background: '#1DA1F2' }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 161, 242, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span>𝕏</span>
        <span>Share</span>
      </a>

      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackShare('linkedin')}
        style={{ ...buttonStyle, background: '#0A66C2' }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(10, 102, 194, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span>in</span>
        <span>Share</span>
      </a>

      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackShare('whatsapp')}
        style={{ ...buttonStyle, background: '#25D366' }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span>📱</span>
        <span>WhatsApp</span>
      </a>

      <a
        href={shareLinks.telegram}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackShare('telegram')}
        style={{ ...buttonStyle, background: '#0088cc' }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 136, 204, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span>✈️</span>
        <span>Telegram</span>
      </a>
    </div>
  );
}
