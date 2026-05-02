import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

export const configurePassportFacebook = () => {
  const clientID = String(process.env.FACEBOOK_APP_ID || '').trim();
  const clientSecret = String(process.env.FACEBOOK_APP_SECRET || '').trim();
  const callbackURL = String(process.env.FACEBOOK_CALLBACK_URL || '').trim();

  console.info('[Auth][Facebook] env loaded:', Boolean(process.env.JWT_SECRET));
  console.info('[Auth][Facebook] FACEBOOK_APP_ID exists:', Boolean(clientID));

  if (!clientID || !clientSecret || !callbackURL) {
    throw new Error('Facebook OAuth not configured');
  }

  const strategyName = 'facebook';
  if (passport._strategies?.[strategyName]) {
    return passport;
  }

  passport.use(
    new FacebookStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          console.info('[Auth][Facebook] profile received:', {
            id: profile?.id || null,
            hasEmail: Boolean(profile?.emails?.[0]?.value),
            hasName: Boolean(profile?.displayName),
            hasAvatar: Boolean(profile?.photos?.[0]?.value),
          });

          const facebookId = String(profile?.id || '').trim();
          const displayName = String(profile?.displayName || '').trim();
          const profileEmail = normalizeEmail(profile?.emails?.[0]?.value || '');
          const avatar = profile?.photos?.[0]?.value || null;

          let user = await User.findOne({ facebookId });

          if (!user && profileEmail) {
            user = await User.findOne({ email: profileEmail });
          }

          if (!user) {
            user = await User.create({
              facebookId,
              facebook_id: facebookId,
              username: displayName || `facebook_${facebookId.slice(-6)}`,
              full_name: displayName || '',
              email: profileEmail || null,
              avatar,
              phone: '',
              role_key: 'customer',
              permissions: [],
              signup_method: 'facebook',
              login_provider: 'facebook',
              email_verified: Boolean(profileEmail),
              social_providers: [{ provider: 'facebook', provider_user_id: facebookId }],
            });
          } else {
            user.facebookId = user.facebookId || facebookId;
            user.facebook_id = user.facebook_id || facebookId;
            user.login_provider = 'facebook';
            if (!user.email && profileEmail) user.email = profileEmail;
            if (!user.full_name && displayName) user.full_name = displayName;
            if (!user.username && displayName) user.username = displayName;
            if (!user.avatar && avatar) user.avatar = avatar;

            if (!Array.isArray(user.social_providers)) user.social_providers = [];
            if (!user.social_providers.some((p) => p.provider === 'facebook')) {
              user.social_providers.push({ provider: 'facebook', provider_user_id: facebookId });
            }

            if (profileEmail && (!user.email || normalizeEmail(user.email) === profileEmail)) {
              user.email = profileEmail;
              user.email_verified = true;
              user.email_verification_code = null;
              user.email_verification_expires_at = null;
              user.email_verification_attempts = 0;
            }

            if (!profileEmail) {
              user.email = user.email || null;
              user.email_verified = false;
            }

            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );

  return passport;
};

export default passport;
