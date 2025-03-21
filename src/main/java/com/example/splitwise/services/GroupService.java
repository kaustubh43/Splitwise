package com.example.splitwise.services;

import com.example.splitwise.models.Group;
import com.example.splitwise.models.User;
import com.example.splitwise.repositories.GroupRepository;
import com.example.splitwise.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupService {
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public GroupService(GroupRepository groupRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    public Group createGroup(String name, List<Long> users) {
        List<User> userList = userRepository.findAllById(users);
        Group group = new Group(name, userList);

        return groupRepository.save(group);
    }

    public Group addToGroup(Long groupId, List<Long> usersIds) {
        List<User> userList = userRepository.findAllById(usersIds);
        Group group = groupRepository.findById(groupId).get();

        List<User> existingUsers = group.getUsers();
        for(User user : userList) {
            if(!existingUsers.contains(user.getId())) {
                existingUsers.add(user);
            }
        }
        group.setUsers(existingUsers);
        return groupRepository.save(group);
    }
}
