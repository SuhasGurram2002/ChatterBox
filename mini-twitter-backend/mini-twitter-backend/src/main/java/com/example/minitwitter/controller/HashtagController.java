package com.example.minitwitter.controller;

import com.example.minitwitter.dto.PostResponse;
import com.example.minitwitter.service.PostService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hashtags")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class HashtagController {

    @Autowired
    private PostService postService;

    @GetMapping("/{tag}/posts")
    public ResponseEntity<List<PostResponse>> getPostsByHashtag(
            @PathVariable String tag,
            HttpSession session) {
        String username = (String) session.getAttribute("currentUser");
        try {
            List<PostResponse> posts = postService.getPostsByHashtag(tag, username);
            return ResponseEntity.ok(posts);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}