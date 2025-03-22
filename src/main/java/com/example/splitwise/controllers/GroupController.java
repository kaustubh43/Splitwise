package com.example.splitwise.controllers;

import com.example.splitwise.dtos.GroupAddUsersRequest;
import com.example.splitwise.dtos.GroupRequest;
import com.example.splitwise.dtos.GroupResponse;
import com.example.splitwise.exceptions.GroupNotExist;
import com.example.splitwise.exceptions.UserAlreadyInGroup;
import com.example.splitwise.exceptions.UserNotExist;
import com.example.splitwise.models.Group;
import com.example.splitwise.services.GroupService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/groups")
public class GroupController {
    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping("/creategroup")
    @ResponseStatus(HttpStatus.CREATED)
    public @ResponseBody GroupResponse createGroup(@RequestBody GroupRequest group) {
        Group newGroup = groupService.createGroup(group.getName(), group.getUserIds());
        return GroupResponse.builder()
                .groupId(newGroup.getId())
                .name(newGroup.getName())
                .build();
    }

    @PatchMapping("/addusers")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public @ResponseBody boolean addUsers(@RequestBody GroupAddUsersRequest request) throws GroupNotExist, UserNotExist, UserAlreadyInGroup {
        Group addedToGroup = groupService.addToGroup(request.getGroupId(), request.getUserIds());
        return addedToGroup != null;
    }
}
