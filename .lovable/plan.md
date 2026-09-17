# Curated Instagram posts

## What will change
- Add an **Instagram posts** tab to the Homepage dashboard.
- Let you manage up to four posts, each with a post link, cover image upload/link, and short caption.
- Display the four saved posts immediately after **Collector notes** on the homepage.
- Each tile opens the original Instagram post, with a clear **Follow @vetaverastudio** link.
- Hide incomplete entries so visitors never see blank tiles.

## Technical details
- Add an `instagram_posts` JSON field to the existing homepage content record with the same public-read/admin-write protection.
- Extend the existing homepage content types, data mapping, fallback content, saving, and live refresh flow.
- Reuse the existing image uploader and resilient image display.
- Validate Instagram URLs before publishing and cap the section at four posts.
- Verify the dashboard editor and homepage at desktop and mobile sizes.
