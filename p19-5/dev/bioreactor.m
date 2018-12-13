% bioreactor model

clear all

% sf and D for oscillations?
sf = 20; % g/L
D = 0.2; % (1/hr), 1.125-0.28, space velocity = flow/vol

Vm = 0.01; % g/g (alpha)
a = 0.03; % L/g (beta)
p = 0.6; % g/g (gamma)

MUmax = 0.3; % (1/hr)
Ks = 1.75; % g/L

vol = 0.1; % L
flow = D*vol

x(1) = 1.322; % g/L, biomass
s(1) = 0.3; % g/l, substrate
t(1) = 0; % hr
dt = 0.1; % hr
for i = 1:2000
    G(i) = MUmax*s(i) / (Ks + s(i)); % growth rate
    V(i) = (Vm + a*s(i))^p; % yield function
    
%     if (t(i) >= 80 && t(i) < 90)
%         Dt = 1.0*D;
%         
%     else
%         Dt = D;
%     end

    Dt = D; % variable to allow purturbations
    
    dsdt = Dt*(sf - s(i)) - (G(i)/V(i))*x(i);
    dxdt = (G(i) - Dt)*x(i);
    
    s(i+1) = s(i) + dsdt * dt;
    x(i+1) = x(i) + dxdt * dt;
    t(i+1) = t(i) + dt;
end
i = i+1;
G(i) = MUmax*s(i) / (Ks + s(i));
V(i) = (Vm + a*s(i))^p; 

figure(1)
plot(t(1500:2000),s(1500:2000),'b',t(1500:2000),x(1500:2000),'g');
title('blue = substrate, green = biomass, vs. t')

figure(2)
plot(t(1500:2000),((G(1500:2000)./V(1500:2000)).*x(1500:2000)),'b',t(1500:2000),V(1500:2000),'g',t(1500:2000),G(1500:2000),'k')
title('blue = (G/V)*x, green = V, black = G, vs. s')
