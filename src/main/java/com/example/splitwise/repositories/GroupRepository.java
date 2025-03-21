package com.example.splitwise.repositories;

import com.example.splitwise.models.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {

    public Optional<Group> findById(Long id);

    public Optional<Group> findByName(String name);
}
