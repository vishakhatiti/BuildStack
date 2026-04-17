const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3 2.3c1.8-1.6 2.8-4 2.8-6.9 0-.7-.1-1.4-.2-2.2H12z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.6 0 4.9-.9 6.5-2.6l-3-2.3c-.8.6-2 1-3.5 1-2.7 0-4.9-1.8-5.7-4.2l-3.1 2.4C4.8 19.8 8.1 22 12 22z"
    />
    <path
      fill="#4A90E2"
      d="M6.3 13.9c-.2-.6-.3-1.3-.3-1.9 0-.7.1-1.3.3-1.9L3.2 7.7A10.1 10.1 0 0 0 2 12c0 1.6.4 3.1 1.2 4.3l3.1-2.4z"
    />
    <path
      fill="#FBBC05"
      d="M12 5.9c1.5 0 2.9.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8.1 2 4.8 4.2 3.2 7.7l3.1 2.4C7.1 7.7 9.3 5.9 12 5.9z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M12 .5C5.7.5.8 5.5.8 11.7c0 5 3.2 9.2 7.7 10.7.6.1.8-.2.8-.6v-2.2c-3.1.7-3.7-1.3-3.7-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.7 2.4 3.3 2.4.8 0 1.3-.3 1.6-.7-.2-.6-.4-2.6.4-3.4-2.5-.3-5.1-1.3-5.1-5.6 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 3 .9a9.9 9.9 0 0 1 5.4 0c2.1-1.2 3-.9 3-.9.6 1.4.2 2.5.1 2.8.7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.6.4.3.8 1 .8 2.1v3.1c0 .4.2.7.8.6a11.1 11.1 0 0 0 7.7-10.7C23.2 5.5 18.3.5 12 .5z"
    />
  </svg>
);

const iconMap = {
  google: GoogleIcon,
  github: GitHubIcon,
};

const OAuthButton = ({ provider, onClick, children, className = "" }) => {
  const Icon = iconMap[provider];

  return (
    <button className={["oauth-button", className].filter(Boolean).join(" ")} type="button" onClick={onClick}>
      <span className="oauth-icon" aria-hidden="true">
        {Icon ? <Icon /> : null}
      </span>
      <span>{children}</span>
    </button>
  );
};

export default OAuthButton;
