package com.example.ilhafit.security;

import com.example.ilhafit.entity.Administrador;
import com.example.ilhafit.entity.Estabelecimento;
import com.example.ilhafit.entity.Profissional;
import com.example.ilhafit.entity.Role;
import com.example.ilhafit.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private Long id;
    private String nome;
    private String email;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private Role role; 

    public static UserPrincipal create(Usuario user) {
        List<GrantedAuthority> authorities = Collections
                .singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return new UserPrincipal(user.getId(), user.getNome(), user.getEmail(), user.getSenha(), authorities,
                user.getRole());
    }

    public static UserPrincipal create(Estabelecimento user) {
        List<GrantedAuthority> authorities = Collections
                .singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return new UserPrincipal(user.getId(), user.getNome(), user.getEmail(), user.getSenha(), authorities,
                user.getRole());
    }

    public static UserPrincipal create(Administrador user) {
        List<GrantedAuthority> authorities = Collections
                .singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return new UserPrincipal(user.getId(), user.getNome(), user.getEmail(), user.getSenha(), authorities,
                user.getRole());
    }

    public static UserPrincipal create(Profissional user) {
        List<GrantedAuthority> authorities = Collections
                .singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return new UserPrincipal(user.getId(), user.getNome(), user.getEmail(), user.getSenha(), authorities,
                user.getRole());
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
