## Packages
framer-motion | Smooth animations for page transitions and micro-interactions
lucide-react | Beautiful icons for the UI
react-hook-form | Form handling for checkout and admin panels
zod | Schema validation for forms
clsx | Utility for conditional classes
tailwind-merge | Utility for merging tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}
API requires `credentials: "include"` for all requests.
Images will be fetched from Unsplash for demo purposes since no file upload is implemented yet.
Mock user ID 1 will be used for cart/orders until auth is fully implemented.
