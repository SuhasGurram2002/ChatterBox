package com.example.minitwitter.service;

import com.example.minitwitter.dto.PostRequest;
import com.example.minitwitter.dto.PostResponse;
import com.example.minitwitter.entity.Hashtag;
import com.example.minitwitter.entity.Post;
import com.example.minitwitter.entity.User;
import com.example.minitwitter.repository.HashtagRepository;
import com.example.minitwitter.repository.LikeRepository;
import com.example.minitwitter.repository.PostRepository;
import com.example.minitwitter.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private HashtagRepository hashtagRepository;

    public Post createPost(PostRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post(request.getContent(), user);

        // Process hashtags
        if (request.getHashtags() != null && !request.getHashtags().isEmpty()) {
            for (String tagName : request.getHashtags()) {
                String cleanTag = tagName.toLowerCase().replaceAll("[^a-z0-9]", "");
                if (!cleanTag.isEmpty()) {
                    Hashtag hashtag = hashtagRepository.findByTag(cleanTag)
                            .orElseGet(() -> {
                                Hashtag newHashtag = new Hashtag(cleanTag);
                                return hashtagRepository.save(newHashtag);
                            });
                    post.addHashtag(hashtag);
                }
            }
        }

        return postRepository.save(post);
    }

    public List<PostResponse> getAllPosts(String currentUsername) {
        List<Post> posts = postRepository.findByOrderByCreatedAtDesc();
        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);

        return posts.stream()
                .map(post -> {
                    boolean liked = currentUser != null &&
                            likeRepository.existsByUserAndPost(currentUser, post);
                    return new PostResponse(post, liked);
                })
                .collect(Collectors.toList());
    }

    public List<PostResponse> getPostsByHashtag(String tag, String currentUsername) {
        Hashtag hashtag = hashtagRepository.findByTag(tag.toLowerCase())
                .orElseThrow(() -> new RuntimeException("Hashtag not found"));

        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);

        return hashtag.getPosts().stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .map(post -> {
                    boolean liked = currentUser != null &&
                            likeRepository.existsByUserAndPost(currentUser, post);
                    return new PostResponse(post, liked);
                })
                .collect(Collectors.toList());
    }
}

