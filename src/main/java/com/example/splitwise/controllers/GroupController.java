package com.example.splitwise.controllers;

import com.example.splitwise.dtos.GroupAddUsersRequest;
import com.example.splitwise.dtos.GroupRequest;
import com.example.splitwise.dtos.GroupResponse;
import com.example.splitwise.models.Group;
import com.example.splitwise.services.GroupService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/groups")
public class GroupController {
    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping("/creategroup")
    public @ResponseBody GroupResponse createGroup(@RequestBody GroupRequest group) {
        Group newGourp = groupService.createGroup(group.getName(), group.getUserIds());
        return GroupResponse.builder()
                .groupId(newGourp.getId())
                .name(newGourp.getName())
                .build();
    }

    @PostMapping("/addusers")
    public @ResponseBody boolean addUsers(@RequestBody GroupAddUsersRequest request) {
        Group addedToGroup = groupService.addToGroup(request.getGroupId(), request.getUserIds());
        return addedToGroup != null;
    }
}
