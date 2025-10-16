package com.example.minitwitter.controller;

import com.example.minitwitter.dto.PostRequest;
import com.example.minitwitter.dto.PostResponse;
import com.example.minitwitter.entity.Post;
import com.example.minitwitter.service.PostService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody PostRequest request, HttpSession session) {
        String username = (String) session.getAttribute("currentUser");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            Post post = postService.createPost(request, username);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts(HttpSession session) {
        String username = (String) session.getAttribute("currentUser");
        List<PostResponse> posts = postService.getAllPosts(username);
        return ResponseEntity.ok(posts);
    }
}
