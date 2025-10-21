import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/post.service';
import { CommentService } from '../services/comment.service';

interface Post {
  id: number;
  content: string;
  username: string;
  fullName: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  hashtags: string[];
}

interface Comment {
  id: number;
  content: string;
  username: string;
  fullName: string;
  createdAt: string;
}

@Component({
  selector: 'app-timeline',
  template: `
    <div class="timeline-container">
      <!-- Post Creation -->
      <div class="create-post-card">
        <h3>What's happening?</h3>
        <form (ngSubmit)="createPost()">
          <textarea 
            [(ngModel)]="newPostContent"
            name="content"
            placeholder="Share your thoughts..."
            class="post-textarea"
            maxlength="280"
            rows="3"></textarea>
          
          <!-- Hashtag Input -->
          <div class="hashtag-input-container">
            <input 
              type="text"
              [(ngModel)]="currentHashtag"
              name="hashtag"
              placeholder="Add hashtags (e.g., coding, javascript)"
              class="hashtag-input"
              (keypress)="onHashtagKeyPress($event)">
            <button 
              type="button" 
              (click)="addHashtag()"
              class="btn btn-small"
              [disabled]="!currentHashtag.trim()">
              Add Tag
            </button>
          </div>
          
          <!-- Display Added Hashtags -->
          <div class="hashtags-display" *ngIf="newPostHashtags.length > 0">
            <span class="hashtag-chip" *ngFor="let tag of newPostHashtags">
              #{{ tag }}
              <button type="button" (click)="removeHashtag(tag)" class="remove-tag">×</button>
            </span>
          </div>
          
          <div class="post-actions">
            <span class="char-count">{{ 280 - newPostContent.length }}</span>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="!newPostContent.trim() || posting">
              {{ posting ? 'Posting...' : 'Post' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Posts Feed -->
      <div class="posts-feed">
        <div class="post-card" *ngFor="let post of posts">
          <div class="post-header">
            <div class="user-info">
              <h4>{{ post.fullName }}</h4>
              <span class="username">@{{ post.username }}</span>
              <span class="timestamp">{{ formatDate(post.createdAt) }}</span>
            </div>
          </div>
          
          <div class="post-content">
            <p>{{ post.content }}</p>
            
            <!-- Display Post Hashtags -->
            <div class="post-hashtags" *ngIf="post.hashtags && post.hashtags.length > 0">
              <span class="post-hashtag" *ngFor="let tag of post.hashtags">
                #{{ tag }}
              </span>
            </div>
          </div>
          
          <div class="post-actions">
            <button 
              (click)="toggleLike(post)"
              class="action-btn like-btn"
              [class.liked]="post.likedByCurrentUser">
              <span class="icon">{{ post.likedByCurrentUser ? '❤️' : '🤍' }}</span>
              <span>{{ post.likeCount }}</span>
            </button>
            
            <button 
              (click)="toggleComments(post.id)"
              class="action-btn comment-btn">
              <span class="icon">💬</span>
              <span>{{ post.commentCount }}</span>
            </button>
          </div>
          
          <!-- Comments Section -->
          <div class="comments-section" *ngIf="showComments[post.id]">
            <div class="add-comment">
              <textarea 
                [(ngModel)]="newCommentContent[post.id]"
                placeholder="Add a comment..."
                class="comment-textarea"
                maxlength="280"
                rows="2"></textarea>
              <button 
                (click)="addComment(post.id)"
                class="btn btn-small"
                [disabled]="!newCommentContent[post.id]?.trim()">
                Comment
              </button>
            </div>
            
            <div class="comments-list">
              <div class="comment" *ngFor="let comment of comments[post.id]">
                <div class="comment-header">
                  <h5>{{ comment.fullName }}</h5>
                  <span class="username">@{{ comment.username }}</span>
                  <span class="timestamp">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timeline-container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .create-post-card, .post-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .create-post-card h3 {
      color: #1da1f2;
      margin-bottom: 1rem;
    }
    
    .post-textarea, .comment-textarea {
      width: 100%;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      padding: 0.8rem;
      font-size: 1rem;
      resize: vertical;
      box-sizing: border-box;
    }
    
    .post-textarea:focus, .comment-textarea:focus {
      outline: none;
      border-color: #1da1f2;
    }
    
    .post-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.8rem;
    }
    
    .char-count {
      color: #657786;
      font-size: 0.9rem;
    }
    
    .btn {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #1da1f2;
      color: white;
    }
    
    .btn-primary:hover {
      background: #1991db;
    }
    
    .btn-primary:disabled {
      background: #aab8c2;
      cursor: not-allowed;
    }
    
    .btn-small {
      padding: 0.4rem 0.8rem;
      font-size: 0.9rem;
      background: #1da1f2;
      color: white;
    }
    
    .post-header {
      margin-bottom: 0.8rem;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .user-info h4 {
      margin: 0;
      color: #14171a;
    }
    
    .username, .timestamp {
      color: #657786;
      font-size: 0.9rem;
    }
    
    .post-content p {
      color: #14171a;
      line-height: 1.4;
      margin: 0.8rem 0;
    }
    
    .post-actions {
      display: flex;
      gap: 2rem;
      padding-top: 0.8rem;
      border-top: 1px solid #f7f9fa;
    }
    
    .action-btn {
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      color: #657786;
      cursor: pointer;
      transition: color 0.2s;
    }
    
    .action-btn:hover {
      color: #1da1f2;
    }
    
    .like-btn.liked {
      color: #e0245e;
    }
    
    .comments-section {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f7f9fa;
    }
    
    .add-comment {
      display: flex;
      gap: 0.8rem;
      margin-bottom: 1rem;
      align-items: flex-end;
    }
    
    .add-comment .comment-textarea {
      flex: 1;
    }
    
    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .comment {
      background: #f7f9fa;
      padding: 0.8rem;
      border-radius: 8px;
    }
    
    .comment-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
    }
    
    .comment-header h5 {
      margin: 0;
      font-size: 0.9rem;
      color: #14171a;
    }
    
    .comment-content {
      margin: 0;
      color: #14171a;
      font-size: 0.9rem;
    }
    
    .hashtag-input-container {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.8rem;
      align-items: center;
    }
    
    .hashtag-input {
      flex: 1;
      padding: 0.6rem;
      border: 1px solid #e1e8ed;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    
    .hashtag-input:focus {
      outline: none;
      border-color: #1da1f2;
    }
    
    .hashtags-display {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.8rem;
    }
    
    .hashtag-chip {
      background: #e8f5fe;
      color: #1da1f2;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-weight: 500;
    }
    
    .remove-tag {
      background: none;
      border: none;
      color: #1da1f2;
      cursor: pointer;
      font-size: 1.2rem;
      line-height: 1;
      padding: 0;
      margin-left: 0.2rem;
    }
    
    .remove-tag:hover {
      color: #e0245e;
    }
    
    .post-hashtags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.8rem;
    }
    
    .post-hashtag {
      color: #1da1f2;
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
    }
    
    .post-hashtag:hover {
      text-decoration: underline;
    }
  `]
})
export class TimelineComponent implements OnInit {
  posts: Post[] = [];
  newPostContent = '';
  currentHashtag = '';
  newPostHashtags: string[] = [];
  posting = false;
  showComments: { [key: number]: boolean } = {};
  comments: { [key: number]: Comment[] } = {};
  newCommentContent: { [key: number]: string } = {};
  
  constructor(
    private postService: PostService,
    private commentService: CommentService
  ) {}
  
  ngOnInit() {
    this.loadPosts();
  }
  
  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }
  
  addHashtag() {
    const tag = this.currentHashtag.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tag && !this.newPostHashtags.includes(tag)) {
      this.newPostHashtags.push(tag);
      this.currentHashtag = '';
    }
  }
  
  removeHashtag(tag: string) {
    this.newPostHashtags = this.newPostHashtags.filter(t => t !== tag);
  }
  
  onHashtagKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addHashtag();
    }
  }
  
  createPost() {
    if (!this.newPostContent.trim()) return;
    
    this.posting = true;
    this.postService.createPost(this.newPostContent, this.newPostHashtags).subscribe({
      next: () => {
        this.newPostContent = '';
        this.newPostHashtags = [];
        this.currentHashtag = '';
        this.posting = false;
        this.loadPosts();
      },
      error: (error) => {
        console.error('Error creating post:', error);
        this.posting = false;
      }
    });
  }
  
  toggleLike(post: Post) {
    this.postService.toggleLike(post.id).subscribe({
      next: (response: any) => {
        post.likedByCurrentUser = response.liked;
        post.likeCount += response.liked ? 1 : -1;
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      }
    });
  }
  
  toggleComments(postId: number) {
    this.showComments[postId] = !this.showComments[postId];
    
    if (this.showComments[postId] && !this.comments[postId]) {
      this.loadComments(postId);
    }
  }
  
  loadComments(postId: number) {
    this.commentService.getComments(postId).subscribe({
      next: (comments) => {
        this.comments[postId] = comments;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
      }
    });
  }
  
  addComment(postId: number) {
    const content = this.newCommentContent[postId]?.trim();
    if (!content) return;
    
    this.commentService.createComment(postId, content).subscribe({
      next: () => {
        this.newCommentContent[postId] = '';
        this.loadComments(postId);
        // Update comment count
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.commentCount++;
        }
      },
      error: (error) => {
        console.error('Error creating comment:', error);
      }
    });
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
    } else {
      return date.toLocaleDateString();
    }
  }
}