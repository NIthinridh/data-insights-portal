package com.datainsights.portal.controller;

import com.datainsights.portal.model.FinancialGoal;
import com.datainsights.portal.model.User;
import com.datainsights.portal.repository.UserRepository;
import com.datainsights.portal.service.FinancialGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/financial")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})
@RequiredArgsConstructor
public class GoalController {

    private final FinancialGoalService goalService;
    private final UserRepository userRepository;

    @GetMapping("/goals")
    public ResponseEntity<List<FinancialGoal>> getAllGoals(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        List<FinancialGoal> goals = goalService.getAllGoalsByUser(user);
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/goals/{id}")
    public ResponseEntity<FinancialGoal> getGoalById(@PathVariable Long id, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        FinancialGoal goal = goalService.getGoalById(id, user);
        return ResponseEntity.ok(goal);
    }

    @PostMapping("/goals")
    public ResponseEntity<FinancialGoal> createGoal(@RequestBody FinancialGoal goal, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        FinancialGoal createdGoal = goalService.createGoal(goal, user);
        return ResponseEntity.ok(createdGoal);
    }

    @PutMapping("/goals/{id}")
    public ResponseEntity<FinancialGoal> updateGoal(@PathVariable Long id, @RequestBody FinancialGoal goal, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        FinancialGoal updatedGoal = goalService.updateGoal(id, goal, user);
        return ResponseEntity.ok(updatedGoal);
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        goalService.deleteGoal(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/goals/{id}/contributions")
    public ResponseEntity<FinancialGoal> addContribution(@PathVariable Long id, @RequestBody Map<String, Object> contribution, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        Double amount = ((Number) contribution.get("amount")).doubleValue();
        FinancialGoal updatedGoal = goalService.addContribution(id, amount, user);
        return ResponseEntity.ok(updatedGoal);
    }

    @GetMapping("/goals/{id}/progress")
    public ResponseEntity<Map<String, Object>> getGoalProgress(@PathVariable Long id, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        Map<String, Object> progress = goalService.getGoalProgress(id, user);
        return ResponseEntity.ok(progress);
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}