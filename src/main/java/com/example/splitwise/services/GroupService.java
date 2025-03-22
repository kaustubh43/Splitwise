package com.example.splitwise.services;

import com.example.splitwise.exceptions.GroupNotExist;
import com.example.splitwise.exceptions.UserAlreadyInGroup;
import com.example.splitwise.exceptions.UserNotExist;
import com.example.splitwise.models.Group;
import com.example.splitwise.models.User;
import com.example.splitwise.repositories.GroupRepository;
import com.example.splitwise.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public Group addToGroup(Long groupId, List<Long> usersIds) throws GroupNotExist, UserNotExist, UserAlreadyInGroup {
        List<User> userList = userRepository.findAllById(usersIds);
        Optional<Group> findGroup = groupRepository.findById(groupId);
        if(findGroup.isEmpty()) {
            throw new GroupNotExist("Group does exist");
        }
        Group group = findGroup.get();
        if(usersIds.size() != userList.size()) {
            throw new UserNotExist("User(s) not found");
        }
        List<User> existingUsers = group.getUsers();
        boolean inserted = false;
        for(User user : userList) {
            if(!existingUsers.contains(user)) {
                existingUsers.add(user);
                inserted = true;
            }
            else{
                throw new UserAlreadyInGroup("User already part of the group");
            }
        }
        if(inserted) {
            group.setUsers(existingUsers);  // Save to database only if a user is saved.
        }
        return inserted ? groupRepository.save(group) : null;
    }
}
