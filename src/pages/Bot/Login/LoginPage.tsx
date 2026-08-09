import { BinollaPlatformAuth } from '@pages/Bot/LinkBinolla/BinollaPlatformAuth';

/**
 * Login = Binolla platform login (not Scar Alpha email/password).
 */
export default function LoginPage() {
  return <BinollaPlatformAuth mode="login" />;
}
