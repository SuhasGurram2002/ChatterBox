package com.example.minitwitter.service;

import com.example.minitwitter.entity.Like;
import com.example.minitwitter.entity.Post;
import com.example.minitwitter.entity.User;
import com.example.minitwitter.repository.LikeRepository;
import com.example.minitwitter.repository.PostRepository;
import com.example.minitwitter.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public boolean toggleLike(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post);

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            return false; // Unliked
        } else {
            Like like = new Like(user, post);
            likeRepository.save(like);
            return true; // Liked
        }
    }
}