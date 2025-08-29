export interface WishlistItem {
  id: string;
  title: string;
  image?: string;
  price?: string;
  currency?: string;
  siteName?: string;
  sourceUrl: string;
  normalizedUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreviewResponse {
  title: string;
  image?: string;
  price?: string;
  currency?: string;
  siteName?: string;
  sourceUrl: string;
}

export interface PreviewRequest {
  url: string;
  raw_html?: string;
}

export interface ApiError {
  error: string;
  field?: string;
}

export interface DatabaseSchema {
  version: number;
  items: WishlistItem[];
}

export interface AddItemParams {
  url?: string;
}

export type RootStackParamList = {
  Home: undefined;
  Add: AddItemParams | undefined;
  Wishlist: undefined;
};

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    placeholder: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
      fontWeight: string;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
    };
  };
}
