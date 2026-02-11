package com.example.ilhafit.security;

import com.example.ilhafit.entity.Administrador;
import com.example.ilhafit.entity.Estabelecimento;
import com.example.ilhafit.entity.Profissional;
import com.example.ilhafit.entity.Usuario;
import com.example.ilhafit.repository.AdministradorRepository;
import com.example.ilhafit.repository.EstabelecimentoRepository;
import com.example.ilhafit.repository.ProfissionalRepository;
import com.example.ilhafit.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final EstabelecimentoRepository estabelecimentoRepository;
    private final AdministradorRepository administradorRepository;
    private final ProfissionalRepository profissionalRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        if (usuario.isPresent()) {
            return UserPrincipal.create(usuario.get());
        }

        Optional<Estabelecimento> estabelecimento = estabelecimentoRepository.findByEmail(email);
        if (estabelecimento.isPresent()) {
            return UserPrincipal.create(estabelecimento.get());
        }

        Optional<Administrador> admin = administradorRepository.findByEmail(email);
        if (admin.isPresent()) {
            return UserPrincipal.create(admin.get());
        }

        Optional<Profissional> profissional = profissionalRepository.findByEmail(email);
        if (profissional.isPresent()) {
            return UserPrincipal.create(profissional.get());
        }

        throw new UsernameNotFoundException("Usuário não encontrado com email: " + email);
    }
}
