export interface Comment {
    id: number;
    LocationId: number;
    UserId: number;
    comment_text: string;
    createdAt: Date;
    user_first_name: string;
    user_last_name: string;
    user_profile_image_url: string;
    comment_address: string;
}
