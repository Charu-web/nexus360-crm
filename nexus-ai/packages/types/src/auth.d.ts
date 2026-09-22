export declare enum OrganizationRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    EMPLOYEE = "EMPLOYEE",
    VIEWER = "VIEWER"
}
export interface UserSession {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    organizationId: string;
    role: OrganizationRole;
    permissions: string[];
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        fullName: string;
        avatarUrl?: string;
    };
    organization: {
        id: string;
        name: string;
        slug: string;
        role: OrganizationRole;
    };
    tokens: AuthTokens;
}
//# sourceMappingURL=auth.d.ts.map