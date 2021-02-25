interface EdgeFollowedBy {
  count: number;
}

interface EdgeFollow {
  count: number;
}

interface EdgeMutualFollowedBy {
  count: number;
  edges: any[];
}

interface PageInfo {
  has_next_page: boolean;
  end_cursor?: any;
}

interface EdgeFelixVideoTimeline {
  count: number;
  page_info: PageInfo;
  edges: any[];
}

interface PageInfo2 {
  has_next_page: boolean;
  end_cursor?: any;
}

interface EdgeOwnerToTimelineMedia {
  count: number;
  page_info: PageInfo2;
  edges: any[];
}

interface PageInfo3 {
  has_next_page: boolean;
  end_cursor?: any;
}

interface EdgeSavedMedia {
  count: number;
  page_info: PageInfo3;
  edges: any[];
}

interface PageInfo4 {
  has_next_page: boolean;
  end_cursor?: any;
}

interface EdgeMediaCollections {
  count: number;
  page_info: PageInfo4;
  edges: any[];
}

interface EdgeRelatedProfiles {
  edges: any[];
}

interface User {
  biography: string;
  blocked_by_viewer: boolean;
  restricted_by_viewer?: any;
  country_block: boolean;
  external_url?: any;
  external_url_linkshimmed?: any;
  edge_followed_by: EdgeFollowedBy;
  fbid: string;
  followed_by_viewer: boolean;
  edge_follow: EdgeFollow;
  follows_viewer: boolean;
  full_name: string;
  has_ar_effects: boolean;
  has_clips: boolean;
  has_guides: boolean;
  has_channel: boolean;
  has_blocked_viewer: boolean;
  highlight_reel_count: number;
  has_requested_viewer: boolean;
  id: string;
  is_business_account: boolean;
  is_joined_recently: boolean;
  business_category_name?: any;
  overall_category_name?: any;
  category_enum?: any;
  category_name?: any;
  is_private: boolean;
  is_verified: boolean;
  edge_mutual_followed_by: EdgeMutualFollowedBy;
  profile_pic_url: string;
  profile_pic_url_hd: string;
  requested_by_viewer: boolean;
  should_show_category: boolean;
  username: string;
  connected_fb_page?: any;
  edge_felix_video_timeline: EdgeFelixVideoTimeline;
  edge_owner_to_timeline_media: EdgeOwnerToTimelineMedia;
  edge_saved_media: EdgeSavedMedia;
  edge_media_collections: EdgeMediaCollections;
  edge_related_profiles: EdgeRelatedProfiles;
}

interface Graphql {
  user: User;
}

export interface IInstagram {
  logging_page_id: string;
  show_suggested_profiles: boolean;
  show_follow_dialog: boolean;
  graphql: Graphql;
  toast_content_on_load?: any;
  show_view_shop: boolean;
  profile_pic_edit_sync_props?: any;
}
