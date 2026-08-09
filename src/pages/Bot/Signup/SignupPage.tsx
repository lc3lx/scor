import { BinollaPlatformAuth } from '@pages/Bot/LinkBinolla/BinollaPlatformAuth';

/**
 * Signup = Binolla platform registration with partner referral (not Scar Alpha accounts).
 */
export default function SignupPage() {
  return <BinollaPlatformAuth mode="register" />;
}
