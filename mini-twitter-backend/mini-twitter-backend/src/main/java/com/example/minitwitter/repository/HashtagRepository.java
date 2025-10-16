// HashtagRepository.java (Corrected)
package com.example.minitwitter.repository;

import com.example.minitwitter.entity.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {
    Optional<Hashtag> findByTag(String tag);

    // FIX: Use @Query with COUNT(p) to explicitly order by the size of the posts collection.
    @Query("SELECT h FROM Hashtag h JOIN h.posts p GROUP BY h ORDER BY COUNT(p) DESC")
    List<Hashtag> findTop10ByPopularity(); // Renamed for clarity, though original name can be kept
}