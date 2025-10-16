package com.example.minitwitter.controller;

import com.example.minitwitter.service.LikeService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @PostMapping
    public ResponseEntity<?> toggleLike(@PathVariable Long postId, HttpSession session) {
        String username = (String) session.getAttribute("currentUser");
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        try {
            boolean liked = likeService.toggleLike(postId, username);
            return ResponseEntity.ok(Map.of("liked", liked));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}