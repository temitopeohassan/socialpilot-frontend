import { useState } from "react";
import {
  BookOpen, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle,
  ExternalLink, Copy, Check, Info, Zap, Shield, Clock,
  Facebook, Instagram, Twitter, Linkedin, Video,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  title: string;
  detail: string;
  warning?: string;
  tip?: string;
  link?: { label: string; url: string };
}

interface Permission {
  name: string;
  why: string;
  required: boolean;
}

interface PlatformGuide {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  accountType: string;
  estimatedTime: string;
  difficulty: "Easy" | "Moderate" | "Advanced";
  overview: string;
  prerequisites: string[];
  steps: Step[];
  permissions: Permission[];
  analyticsNotes: string[];
  troubleshooting: { problem: string; solution: string }[];
  usefulLinks: { label: string; url: string }[];
}

// ─── Platform Data ────────────────────────────────────────────────────────────

const platforms: PlatformGuide[] = [
  {
    id: "facebook",
    name: "Facebook",
    icon: <Facebook size={22} />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    accountType: "Facebook Page (Business or Creator)",
    estimatedTime: "15–20 minutes",
    difficulty: "Moderate",
    overview:
      "SocialPilot connects to Facebook Pages — not personal profiles. You need a Page with Admin access and a Facebook Developer App to generate the required access tokens. Once connected, SocialPilot can publish posts, images, videos, and links, and pull detailed analytics via the Graph API.",
    prerequisites: [
      "A Facebook account with Admin access to at least one Facebook Page",
      "A Facebook Developer account (free at developers.facebook.com)",
      "Your Page must not be restricted or unpublished",
      "For analytics: the Page must be linked to a Business Manager (Meta Business Suite)",
    ],
    steps: [
      {
        title: "Create a Facebook Developer App",
        detail:
          "Go to developers.facebook.com → My Apps → Create App. Choose 'Business' as the app type. Give it a name (e.g. 'SocialPilot Integration'). You don't need to publish this app — it's just to generate tokens.",
        link: { label: "Facebook Developer Console", url: "https://developers.facebook.com/apps" },
      },
      {
        title: "Add the Facebook Login product",
        detail:
          "Inside your new app, click 'Add Product' and select 'Facebook Login'. Choose 'Web' as the platform. Set the Valid OAuth Redirect URI to your SocialPilot deployment URL (e.g. https://yourdomain.com/api/auth/facebook/callback). Save changes.",
      },
      {
        title: "Request the required permissions",
        detail:
          "Go to App Review → Permissions and Features. Request the following permissions: pages_manage_posts, pages_read_engagement, pages_show_list. For analytics you also need pages_read_user_content. Note: these require App Review from Meta if your app is public, but in Development mode they work for accounts listed as testers.",
        warning:
          "If your app is in Development mode, only users added as Testers or Developers in the app can connect. Switch to Live mode after passing App Review to allow all users.",
      },
      {
        title: "Generate a Page Access Token",
        detail:
          "Go to Tools → Graph API Explorer. Select your app from the dropdown. Click 'Get User Access Token' and select the permissions listed above. Then run: GET /me/accounts — this returns all Pages you manage with their individual Page Access Tokens. Copy the token for the Page you want to connect.",
        tip: "Page Access Tokens don't expire if generated from a long-lived User Access Token. To convert: GET /oauth/access_token?grant_type=fb_exchange_token&client_id={app_id}&client_secret={app_secret}&fb_exchange_token={short_lived_token}",
      },
      {
        title: "Connect the Page in SocialPilot",
        detail:
          "In SocialPilot, go to Accounts → Add Account → Facebook. Enter your Page ID (found in your Page's About section or via GET /me/accounts), your Page Access Token, and the Page name. SocialPilot will verify the token and save the connection.",
        link: { label: "Find your Page ID", url: "https://www.facebook.com/help/1503421039731588" },
      },
      {
        title: "Verify the connection",
        detail:
          "After saving, go to Accounts and check that the Facebook page shows as Active. Try publishing a test post in Draft mode first to confirm the token has the right permissions before scheduling live content.",
      },
    ],
    permissions: [
      { name: "pages_manage_posts", why: "Publish, edit, and delete posts on your Page", required: true },
      { name: "pages_read_engagement", why: "Read post engagement (likes, comments, shares)", required: true },
      { name: "pages_show_list", why: "List all Pages you manage", required: true },
      { name: "pages_read_user_content", why: "Read post content for analytics", required: false },
      { name: "instagram_basic", why: "Required if your Page is linked to an Instagram Business account", required: false },
    ],
    analyticsNotes: [
      "Impressions, reach, and engagement are available via the /insights endpoint on published posts",
      "Analytics data is usually available 1–2 hours after publishing — SocialPilot's 1h snapshot may return zeros for very new posts",
      "Video metrics (views, average watch time) require the video to be uploaded directly via the API, not shared via URL",
      "Boosted posts (paid) and organic posts have separate metrics — SocialPilot only pulls organic analytics",
    ],
    troubleshooting: [
      {
        problem: "Error: (#200) The user hasn't authorized the application to perform this action",
        solution: "Your token is missing a required permission. Re-generate the token in Graph API Explorer and ensure all required permissions are checked before generating.",
      },
      {
        problem: "Error: Invalid OAuth access token",
        solution: "The token has expired. Page Access Tokens generated from short-lived User Tokens expire in 1 hour. Exchange for a long-lived token first (see Step 4 tip), then regenerate the Page token.",
      },
      {
        problem: "Post publishes but analytics show 0 for everything",
        solution: "Analytics take 1–2 hours to populate. Use the 'Fetch Now' button in SocialPilot Analytics after waiting at least 2 hours. Also confirm the Page has had at least one organic reach event.",
      },
      {
        problem: "Can't see my Page in /me/accounts",
        solution: "You may not have Admin access to the Page. Ask the Page owner to grant you Admin role in Page Settings → Page Roles.",
      },
    ],
    usefulLinks: [
      { label: "Graph API Explorer", url: "https://developers.facebook.com/tools/explorer" },
      { label: "Facebook Login Permissions Reference", url: "https://developers.facebook.com/docs/permissions/reference" },
      { label: "Page Access Token guide", url: "https://developers.facebook.com/docs/pages/access-tokens" },
      { label: "App Review overview", url: "https://developers.facebook.com/docs/app-review" },
    ],
  },

  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram size={22} />,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    accountType: "Instagram Business or Creator Account",
    estimatedTime: "20–30 minutes",
    difficulty: "Moderate",
    overview:
      "Instagram's API only works with Business or Creator accounts — personal accounts are not supported. Your Instagram account must be linked to a Facebook Page. SocialPilot uses the Instagram Graph API (via the Facebook Developer Platform) to publish images, carousels, Reels, and Stories, and to pull post-level analytics.",
    prerequisites: [
      "An Instagram Business or Creator account (not a personal account)",
      "The Instagram account must be linked to a Facebook Page you Admin",
      "A Facebook Developer App (same one used for Facebook, or a new one)",
      "At least one image or video URL accessible via public HTTPS for publishing",
    ],
    steps: [
      {
        title: "Convert your Instagram account to Business or Creator",
        detail:
          "In the Instagram app: Profile → Settings → Account → Switch to Professional Account. Choose Business (for brands/companies) or Creator (for individuals/influencers). Follow the prompts to set a category.",
        warning:
          "You cannot connect a personal Instagram account. If you skip this step, the API will return a 'not a business account' error.",
      },
      {
        title: "Link Instagram to a Facebook Page",
        detail:
          "In Facebook: go to your Page → Settings → Instagram. Click 'Connect Account' and log in with your Instagram credentials. This link is mandatory for the Graph API to work — Instagram's API routes through Facebook's infrastructure.",
      },
      {
        title: "Add Instagram Graph API to your Facebook Developer App",
        detail:
          "In your Developer App: Add Product → Instagram Graph API. No extra configuration needed at this stage. The product just needs to be added.",
      },
      {
        title: "Get your Instagram Business Account ID",
        detail:
          "In Graph API Explorer: GET /{facebook_page_id}?fields=instagram_business_account with your Page Access Token. Copy the id value from instagram_business_account — this is your Instagram User ID for all future API calls.",
        tip: "Save this ID — you'll need it when connecting in SocialPilot. It looks like a long number, e.g. 17841400008460056.",
      },
      {
        title: "Request the required permissions",
        detail:
          "In your app's permissions, ensure you have: instagram_basic, instagram_content_publish, instagram_manage_insights (for analytics), and pages_read_engagement. These must be approved under your User Access Token scope.",
      },
      {
        title: "Connect Instagram in SocialPilot",
        detail:
          "Go to Accounts → Add Account → Instagram. Enter your Instagram Business Account ID, your Page Access Token (the same long-lived token from the linked Facebook Page), and your Instagram username. Save.",
        tip: "SocialPilot uses a two-step publish flow for Instagram: first it creates a media container (POST /media), then publishes it (POST /media_publish). Both steps happen automatically.",
      },
    ],
    permissions: [
      { name: "instagram_basic", why: "Read basic Instagram account info and media", required: true },
      { name: "instagram_content_publish", why: "Publish images, videos, carousels, and Reels", required: true },
      { name: "instagram_manage_insights", why: "Access post-level analytics (impressions, reach, saves)", required: false },
      { name: "pages_read_engagement", why: "Required base permission alongside Instagram scopes", required: true },
    ],
    analyticsNotes: [
      "Instagram analytics (impressions, reach, likes, comments, shares, saves) are available via /insights on each media object",
      "Insights require the instagram_manage_insights permission AND the post to have at least some reach — private or very low-reach posts may return empty",
      "Story insights (impressions, replies, exits) are separate from feed post insights and expire after 24 hours",
      "Reel metrics include plays, reach, likes, comments, shares, and saves — returned from the same /insights endpoint",
      "Instagram doesn't expose click-through data for organic posts; only paid promotion includes link clicks",
    ],
    troubleshooting: [
      {
        problem: "Error: (#10) Application does not have permission for this action",
        solution: "instagram_content_publish is not approved for your token. Re-generate your User Access Token in Graph API Explorer and check that instagram_content_publish is in the permissions list.",
      },
      {
        problem: "Error: Media type not supported",
        solution: "Instagram requires image URLs to be publicly accessible HTTPS links. Local or presigned S3 URLs with short expiry may fail. Use a permanent CDN URL for images.",
      },
      {
        problem: "Instagram Business Account ID returns empty",
        solution: "The Facebook Page and Instagram account are not properly linked. Go back to Step 2 and ensure the Instagram account is connected to the Page in Facebook Page Settings → Instagram.",
      },
      {
        problem: "Post published but shows no analytics",
        solution: "Instagram insights take up to 2 hours to appear. Also, if the post reached fewer than ~100 accounts, Meta may suppress metrics to protect user privacy.",
      },
    ],
    usefulLinks: [
      { label: "Instagram Graph API overview", url: "https://developers.facebook.com/docs/instagram-api" },
      { label: "Content Publishing guide", url: "https://developers.facebook.com/docs/instagram-api/guides/content-publishing" },
      { label: "Instagram Insights", url: "https://developers.facebook.com/docs/instagram-api/guides/insights" },
      { label: "Convert to Professional Account", url: "https://help.instagram.com/502981923235522" },
    ],
  },

  {
    id: "twitter",
    name: "Twitter / X",
    icon: <Twitter size={22} />,
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
    borderColor: "border-sky-400/30",
    accountType: "Any Twitter/X account",
    estimatedTime: "10–15 minutes",
    difficulty: "Easy",
    overview:
      "Twitter/X uses OAuth 2.0 with PKCE for authentication. You'll create a Developer App at developer.twitter.com and generate a Bearer Token for publishing. Note: Twitter's free API tier supports tweet creation but restricts analytics — engagement metrics require a Basic ($100/month) or Pro ($5,000/month) plan.",
    prerequisites: [
      "A Twitter/X account (any type)",
      "A Twitter Developer account (apply at developer.twitter.com — approval usually takes minutes)",
      "For analytics: a Basic or Pro API subscription",
    ],
    steps: [
      {
        title: "Apply for Twitter Developer Access",
        detail:
          "Go to developer.twitter.com and sign in with your Twitter account. Click 'Apply' and answer the use-case questions honestly — describe that you're building a social media management tool for scheduling and analytics. Approval is usually instant for the free tier.",
        link: { label: "Twitter Developer Portal", url: "https://developer.twitter.com/en/portal/dashboard" },
      },
      {
        title: "Create a Developer Project and App",
        detail:
          "In the Developer Portal: Projects & Apps → New Project. Name it (e.g. 'SocialPilot'). Create an App inside the project. Select 'Production' environment. Set the App permissions to 'Read and Write' — Read-only won't allow tweeting.",
        warning:
          "The App permission level (Read and Write) must be set BEFORE generating tokens. Changing it afterward requires regenerating all tokens.",
      },
      {
        title: "Set up OAuth 2.0",
        detail:
          "In your App settings: User authentication settings → Set up. Enable OAuth 2.0. Set Type of App to 'Web App, Automated App or Bot'. Add your Callback URL (your SocialPilot URL + /api/auth/twitter/callback) and Website URL. Save.",
      },
      {
        title: "Generate API Keys and Bearer Token",
        detail:
          "Go to your App's 'Keys and Tokens' tab. Generate: API Key, API Key Secret, Bearer Token, Access Token, and Access Token Secret. Copy all five values — the Access Token and Secret are specific to your own account for posting on its behalf.",
        tip: "Store these securely in your .env file. Never commit them to version control. If exposed, regenerate immediately.",
      },
      {
        title: "Connect Twitter in SocialPilot",
        detail:
          "Go to Accounts → Add Account → Twitter/X. Enter your Access Token and Access Token Secret (these represent the account that tweets will be posted from). The Bearer Token is used for API-level authentication. Save the account.",
      },
    ],
    permissions: [
      { name: "tweet.read", why: "Read tweets and account information", required: true },
      { name: "tweet.write", why: "Post new tweets and reply to tweets", required: true },
      { name: "users.read", why: "Read basic user profile information", required: true },
      { name: "offline.access", why: "Maintain access without re-authentication", required: false },
    ],
    analyticsNotes: [
      "Free tier: only public_metrics (like_count, reply_count, retweet_count, impression_count) — no click data",
      "Basic tier ($100/mo): adds non_public_metrics including url_link_clicks and user_profile_clicks",
      "Pro tier ($5,000/mo): organic_metrics, promoted_metrics, and full historical data",
      "SocialPilot will fetch whatever your tier permits — if you're on free, click metrics will show 0",
      "Tweet impressions on the free tier are estimated from follower count and may not be precise",
    ],
    troubleshooting: [
      {
        problem: "Error 403: Forbidden — You are not permitted to use this endpoint",
        solution: "Your App permissions are set to Read-only. Go to App Settings → User authentication settings and change to 'Read and Write'. Then regenerate your Access Token and Secret.",
      },
      {
        problem: "Error 401: Unauthorized",
        solution: "Your tokens are invalid or regenerated. Go back to the Developer Portal, regenerate the Access Token and Secret, and update them in SocialPilot Accounts.",
      },
      {
        problem: "Analytics show 0 for clicks and profile visits",
        solution: "These metrics require a paid API tier (Basic or Pro). The free tier only provides public metrics. Upgrade your Twitter API subscription if this data is important to you.",
      },
      {
        problem: "Tweet fails with 'duplicate content' error",
        solution: "Twitter rejects identical tweets posted within a short window. If you're testing, vary the text slightly each time.",
      },
    ],
    usefulLinks: [
      { label: "Twitter Developer Portal", url: "https://developer.twitter.com/en/portal/dashboard" },
      { label: "OAuth 2.0 setup guide", url: "https://developer.twitter.com/en/docs/authentication/oauth-2-0" },
      { label: "Tweet creation reference", url: "https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets" },
      { label: "API Access Levels (pricing)", url: "https://developer.twitter.com/en/products/twitter-api" },
    ],
  },

  {
    id: "linkedin",
    name: "LinkedIn",
    icon: <Linkedin size={22} />,
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    borderColor: "border-blue-600/30",
    accountType: "LinkedIn Personal Profile or Company Page",
    estimatedTime: "15–20 minutes",
    difficulty: "Moderate",
    overview:
      "LinkedIn is the most analytics-friendly platform for organic content — its Share Statistics API is accessible without a paid tier. SocialPilot supports both personal profiles (via Member tokens) and Company Pages (via Organization tokens). You'll need to apply for LinkedIn API access through the Developer Portal.",
    prerequisites: [
      "A LinkedIn account",
      "For Company Pages: Admin access to the Company Page",
      "A LinkedIn Developer App (apply at linkedin.com/developers)",
      "Your Developer App must be verified — LinkedIn requires a company website during app creation",
    ],
    steps: [
      {
        title: "Create a LinkedIn Developer App",
        detail:
          "Go to linkedin.com/developers → My Apps → Create App. Enter a name, link it to a LinkedIn Page (you need at least a Company Page to create the app — create a simple one if you don't have one). Upload a logo and agree to the terms.",
        link: { label: "LinkedIn Developer Portal", url: "https://www.linkedin.com/developers/apps" },
        tip: "The LinkedIn Page you link to the app doesn't have to be the one you're posting from. It's just for app verification purposes.",
      },
      {
        title: "Request the required products",
        detail:
          "In your app's Products tab, request access to: 'Share on LinkedIn' (for posting) and 'Marketing Developer Platform' (for analytics). Share on LinkedIn is approved instantly. Marketing Developer Platform requires manual review and may take 1–3 business days.",
        warning:
          "Without 'Share on LinkedIn', the posting API will return 403 errors. Without 'Marketing Developer Platform', analytics will not be available.",
      },
      {
        title: "Configure OAuth 2.0 settings",
        detail:
          "Go to Auth tab. Add your Redirect URL (your SocialPilot URL + /api/auth/linkedin/callback). The Client ID and Client Secret are shown on this page — copy them. These are used to generate OAuth tokens for each user who connects their LinkedIn account.",
      },
      {
        title: "Generate an OAuth Access Token",
        detail:
          "Use the OAuth 2.0 authorization flow. Direct users to: https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={your_client_id}&redirect_uri={your_callback}&scope=r_liteprofile%20r_emailaddress%20w_member_social%20r_organization_social%20rw_organization_admin. After authorization, exchange the code for an access token at POST /oauth/v2/accessToken.",
        tip: "LinkedIn access tokens are valid for 60 days. Store the refresh token and implement automatic renewal to avoid reconnection prompts.",
      },
      {
        title: "Get your Member URN or Organization URN",
        detail:
          "For personal profiles: GET /v2/me — returns your member ID. Your author URN is urn:li:person:{id}. For Company Pages: GET /v2/organizationalEntityAcls?q=roleAssignee — returns all organizations you admin. Company URN is urn:li:organization:{id}.",
      },
      {
        title: "Connect LinkedIn in SocialPilot",
        detail:
          "Go to Accounts → Add Account → LinkedIn. Enter your Access Token, your profile/company URN, and the account display name. Save. SocialPilot will use the UGC Posts API (POST /v2/ugcPosts) for all content publishing.",
      },
    ],
    permissions: [
      { name: "r_liteprofile", why: "Read basic profile information (name, avatar)", required: true },
      { name: "w_member_social", why: "Post, comment, and like on behalf of a member", required: true },
      { name: "r_organization_social", why: "Read posts and analytics for Company Pages", required: false },
      { name: "rw_organization_admin", why: "Manage Company Page posts and access admin analytics", required: false },
      { name: "r_emailaddress", why: "Read email address for account identification", required: true },
    ],
    analyticsNotes: [
      "LinkedIn provides the richest organic analytics of any platform — impressions, unique impressions, clicks, likes, comments, shares, and engagement rate are all available",
      "Share Statistics are available via GET /v2/shareStatistics?q=shares — no paid tier required",
      "Organization analytics (for Company Pages) require the Marketing Developer Platform product to be approved",
      "Analytics are typically available within 30 minutes of publishing — faster than Facebook or Instagram",
      "LinkedIn does not provide audience demographic breakdowns via the organic API; those require the Marketing API",
    ],
    troubleshooting: [
      {
        problem: "Error 403: Not enough permissions to access: POST /v2/ugcPosts",
        solution: "The 'Share on LinkedIn' product hasn't been added to your app, or your token lacks w_member_social scope. Check Products tab in Developer Portal and re-generate your token.",
      },
      {
        problem: "Token expires after 60 days — users keep getting disconnected",
        solution: "Implement the LinkedIn refresh token flow. When generating the initial token, request the offline_access scope to receive a refresh token. Use it before expiry to get a new 60-day access token without user interaction.",
      },
      {
        problem: "Organization URN not found in /v2/organizationalEntityAcls",
        solution: "You may not have the correct admin role. LinkedIn requires ADMINISTRATOR or DIRECT_SPONSORED_CONTENT_POSTER roles to use the API on behalf of an organization. Check Page Admin settings.",
      },
      {
        problem: "Analytics return empty for Company Page",
        solution: "Marketing Developer Platform approval is pending or not requested. This product requires manual review. Check your app's Products tab for status. While pending, only member-level analytics are accessible.",
      },
    ],
    usefulLinks: [
      { label: "LinkedIn Developer Portal", url: "https://www.linkedin.com/developers/apps" },
      { label: "UGC Posts API reference", url: "https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api" },
      { label: "Share Statistics API", url: "https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-statistics-api" },
      { label: "OAuth 2.0 scopes", url: "https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow" },
    ],
  },

  {
    id: "tiktok",
    name: "TikTok",
    icon: <Video size={22} />,
    color: "text-white",
    bgColor: "bg-gray-700/40",
    borderColor: "border-gray-600/50",
    accountType: "TikTok Business or Creator Account",
    estimatedTime: "25–35 minutes",
    difficulty: "Advanced",
    overview:
      "TikTok's Content Posting API is the most complex of the five platforms. It requires a TikTok for Business account, a separate developer app on TikTok for Developers, and a multi-step video upload process (direct post or file upload). The API is separate from TikTok Creator tools and requires Business API access approval.",
    prerequisites: [
      "A TikTok Business Account or Creator account with at least 1,000 followers (for some API features)",
      "A TikTok for Business account at business.tiktok.com",
      "A developer app created at developers.tiktok.com",
      "All published content must be video — TikTok does not support image-only posts via API",
    ],
    steps: [
      {
        title: "Create a TikTok for Developers App",
        detail:
          "Go to developers.tiktok.com → Manage Apps → Create App. Set the app category to 'Content Creation Tool'. Fill in the app name, website, and description. A privacy policy URL is required — you can use your SocialPilot deployment URL + /privacy for now.",
        link: { label: "TikTok Developer Console", url: "https://developers.tiktok.com/apps" },
        warning:
          "TikTok requires manual approval for Content Posting API access. Approval can take 5–14 business days. Submit a clear description of your use case.",
      },
      {
        title: "Request Content Posting API access",
        detail:
          "Inside your app, go to Products → Content Posting API → Apply. Describe that you are building a social media management platform for scheduling video content. You'll need to provide: your app's purpose, expected monthly API calls, and a link to your platform.",
      },
      {
        title: "Configure Login Kit for OAuth",
        detail:
          "Add 'Login Kit' to your app products. Set the Redirect Domain to your SocialPilot domain. Set the iOS/Android Bundle ID if you have a mobile app. For web, just the domain is needed. This enables users to connect their TikTok accounts via OAuth.",
      },
      {
        title: "Generate API credentials",
        detail:
          "In your app's Basic Info section, copy the Client Key and Client Secret. These are used in the OAuth flow. To get a user access token: direct the user to https://www.tiktok.com/v2/auth/authorize/?client_key={key}&response_type=code&scope=video.publish,video.list&redirect_uri={callback}.",
      },
      {
        title: "Handle the multi-step video upload",
        detail:
          "TikTok's API requires a two-step process: (1) Initialize the upload with POST /v2/post/publish/video/init/ — returns an upload_url and publish_id. (2) Upload the actual video file via PUT to the upload_url. (3) Check status via GET /v2/post/publish/status/fetch/?publish_id={id}. SocialPilot handles all three steps automatically — you just need the connection set up.",
        tip: "Videos must be MP4 or WebM, between 3 seconds and 10 minutes, under 4GB. The upload URL is only valid for 30 minutes after initialization.",
      },
      {
        title: "Connect TikTok in SocialPilot",
        detail:
          "Once API access is approved and OAuth is configured, go to Accounts → Add Account → TikTok. SocialPilot will redirect you through TikTok's OAuth flow. After authorization, your TikTok account will appear in the Accounts list. Note: you'll only be able to publish video content to TikTok.",
      },
    ],
    permissions: [
      { name: "video.publish", why: "Upload and publish video content to TikTok", required: true },
      { name: "video.list", why: "List published videos and access post IDs for analytics", required: true },
      { name: "user.info.basic", why: "Read basic account information (username, avatar)", required: true },
    ],
    analyticsNotes: [
      "TikTok analytics are available via POST /v2/video/query/ with a list of video IDs",
      "Available metrics: view_count, like_count, comment_count, share_count, reach, and profile_visit_count",
      "Analytics data is available approximately 3–6 hours after publishing — TikTok has the longest analytics delay of all supported platforms",
      "Unlike other platforms, TikTok analytics do not differentiate between For You Page (FYP) impressions and follower feed impressions",
      "Creator-level demographics (audience age, gender, location) require the Research API which has a separate approval process",
    ],
    troubleshooting: [
      {
        problem: "API access application rejected",
        solution: "TikTok is selective about third-party scheduling tools. Ensure your application clearly describes a legitimate business use case, has a real privacy policy, and your platform is live and accessible. Reapply with more detail if rejected.",
      },
      {
        problem: "Error: The scope is not authorized",
        solution: "The user hasn't granted video.publish in the OAuth flow. Check that your authorization URL includes scope=video.publish,video.list and prompt the user to re-authorize.",
      },
      {
        problem: "Video upload fails with 'invalid upload URL'",
        solution: "Upload URLs expire after 30 minutes. If the upload takes longer or is delayed, re-initialize the upload to get a fresh URL. Large files should be uploaded immediately after initialization.",
      },
      {
        problem: "Post status shows 'processing' indefinitely",
        solution: "TikTok processing can take up to 20 minutes for long videos. If it exceeds 30 minutes, the video likely failed TikTok's automated content review (music copyright, community guidelines). Check the TikTok account directly for any violation notices.",
      },
    ],
    usefulLinks: [
      { label: "TikTok Developer Console", url: "https://developers.tiktok.com/apps" },
      { label: "Content Posting API docs", url: "https://developers.tiktok.com/doc/content-posting-api-get-started" },
      { label: "Login Kit OAuth guide", url: "https://developers.tiktok.com/doc/login-kit-web" },
      { label: "TikTok for Business", url: "https://business.tiktok.com" },
    ],
  },
];

// ─── Helper components ────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 ml-2"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Easy: "bg-green-500/15 text-green-400",
    Moderate: "bg-yellow-500/15 text-yellow-400",
    Advanced: "bg-red-500/15 text-red-400",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[level]}`}>{level}</span>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SetupGuidePage() {
  const [activeId, setActiveId] = useState<string>("facebook");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    steps: true, permissions: false, analytics: false, troubleshooting: false,
  });

  const toggleSection = (key: string) =>
    setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const active = platforms.find(p => p.id === activeId)!;

  return (
    <div className="flex h-full">
      {/* Platform sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-gray-800 py-6 overflow-y-auto">
        <p className="px-5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Platforms
        </p>
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors text-left ${
              activeId === p.id
                ? "bg-violet-600/15 text-white border-r-2 border-violet-500"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <span className={p.color}>{p.icon}</span>
            {p.name}
          </button>
        ))}

        {/* Quick links */}
        <div className="px-5 mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Quick Links
          </p>
          <a href="/app/accounts" className="flex items-center gap-2 text-xs text-gray-400 hover:text-violet-400 py-1.5">
            <Zap size={12} /> Connect Accounts
          </a>
          <a href="/app/analytics" className="flex items-center gap-2 text-xs text-gray-400 hover:text-violet-400 py-1.5">
            <Shield size={12} /> View Analytics
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-6">

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl ${active.bgColor} border ${active.borderColor} flex items-center justify-center ${active.color} flex-shrink-0`}>
              {active.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{active.name} Setup</h1>
                <DifficultyBadge level={active.difficulty} />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Clock size={11} /> {active.estimatedTime}</span>
                <span className="flex items-center gap-1"><Shield size={11} /> {active.accountType}</span>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className={`${active.bgColor} border ${active.borderColor} rounded-xl p-5 mb-5`}>
            <p className="text-sm leading-relaxed text-gray-200">{active.overview}</p>
          </div>

          {/* Prerequisites */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <CheckCircle2 size={15} className="text-violet-400" /> Before you start
            </h2>
            <ul className="space-y-2">
              {active.prerequisites.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle2 size={13} className="text-green-400 mt-0.5 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <Collapsible
            title={`Setup Steps (${active.steps.length})`}
            icon={<BookOpen size={15} className="text-violet-400" />}
            open={openSections.steps}
            onToggle={() => toggleSection("steps")}
          >
            <div className="space-y-5">
              {active.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400">
                    {i + 1}
                  </div>
                  <div className="flex-1 pb-5 border-b border-gray-800 last:border-0 last:pb-0">
                    <h3 className="font-medium text-sm mb-1.5">{step.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-2">{step.detail}</p>

                    {step.warning && (
                      <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-2">
                        <AlertTriangle size={13} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-300">{step.warning}</p>
                      </div>
                    )}
                    {step.tip && (
                      <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-2">
                        <Info size={13} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-300">{step.tip}</p>
                      </div>
                    )}
                    {step.link && (
                      <a href={step.link.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 mt-1">
                        <ExternalLink size={11} /> {step.link.label}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Collapsible>

          {/* Permissions */}
          <Collapsible
            title="Required Permissions"
            icon={<Shield size={15} className="text-violet-400" />}
            open={openSections.permissions}
            onToggle={() => toggleSection("permissions")}
          >
            <div className="space-y-3">
              {active.permissions.map((perm, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-gray-800 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <code className="text-xs bg-gray-800 px-2 py-0.5 rounded text-violet-300">{perm.name}</code>
                      <CopyButton text={perm.name} />
                    </div>
                    <p className="text-xs text-gray-400">{perm.why}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${perm.required ? "bg-red-500/15 text-red-400" : "bg-gray-700 text-gray-400"}`}>
                    {perm.required ? "Required" : "Optional"}
                  </span>
                </div>
              ))}
            </div>
          </Collapsible>

          {/* Analytics Notes */}
          <Collapsible
            title="Analytics & Data Notes"
            icon={<Zap size={15} className="text-violet-400" />}
            open={openSections.analytics}
            onToggle={() => toggleSection("analytics")}
          >
            <ul className="space-y-3">
              {active.analyticsNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <Info size={13} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </Collapsible>

          {/* Troubleshooting */}
          <Collapsible
            title={`Troubleshooting (${active.troubleshooting.length} common issues)`}
            icon={<AlertTriangle size={15} className="text-yellow-400" />}
            open={openSections.troubleshooting}
            onToggle={() => toggleSection("troubleshooting")}
          >
            <div className="space-y-5">
              {active.troubleshooting.map((item, i) => (
                <div key={i} className="border-l-2 border-yellow-500/30 pl-4">
                  <p className="text-sm font-medium text-yellow-300 mb-1 flex items-start gap-1.5">
                    <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                    {item.problem}
                  </p>
                  <p className="text-sm text-gray-400">{item.solution}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          {/* Useful Links */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mt-4">
            <h2 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <ExternalLink size={15} className="text-violet-400" /> Official Documentation
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {active.usefulLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 py-1.5 group">
                  <ExternalLink size={11} className="flex-shrink-0" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 bg-violet-600/10 border border-violet-500/20 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm mb-0.5">Ready to connect?</p>
              <p className="text-xs text-gray-400">Head to Accounts and add your {active.name} account.</p>
            </div>
            <a href="/app/accounts"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              <Zap size={14} /> Connect {active.name}
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Collapsible({ title, icon, open, onToggle, children }: {
  title: string; icon: React.ReactNode; open: boolean;
  onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-4">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors">
        <span className="flex items-center gap-2 font-medium text-sm">
          {icon} {title}
        </span>
        {open ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}
