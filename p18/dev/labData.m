% readings from Web Labs, Lab 2 - rxn & diff

% interpolate at this increment
inc = 0.001;
    
% col 1 is conc (0-1), col 2 is rate
dup = [0 0 % data on upper branch 
    0.02 1.574e-4
    0.05 3.305e-4
    0.07 4.103e-4
    0.1 4.956e-4
    0.12 5.377e-4 
    0.15 5.869e-4
    0.2 6.462e-4
    0.25 6.889e-4
    0.3 7.218e-4
    0.35 7.484e-4
    0.4 7.706e-4
    0.45 7.896e-4
    0.5 8.061e-4
    0.6 8.337e-4
    0.7 8.518e-4]; % 0.70 max on high branch

plot(dup(:,1),dup(:,2),'bo')
hold on
coef = polyfit(dup(:,1),dup(:,2),7);
cp = linspace(0,0.7,1000);
rp = polyval(coef,cp);
% plot(cp,rp,'r')

ddn = [1 1.179e-4 % data on lower branch
    0.9 1.324e-4
    0.8 1.514e-4
    0.7 1.776e-4
    0.6 2.176e-4
    0.55 2.481e-4
    0.53 2.640e-4
    0.5 2.953e-4
    0.48 3.256e-4
    0.47 3.473e-4
    0.46 3.826e-4]; % 0.46 min on low branch
    
ddn = flip(ddn); % reverse order

plot(ddn(:,1),ddn(:,2),'bo')
coef = polyfit(ddn(:,1),ddn(:,2), 5);
cp = linspace(0.46,1.0,500);
rp = polyval(coef,cp);
% plot(cp,rp,'r')

% how to generate in matlab interpolated points?
% for each pt to last-1
% get value for each 0.01 conc between
% that point and next pt in data 

% process HIGH branch
[r c] = size(dup);
dupp = [0 0];
counter = 0;
for j = 1:r-1
    % get conc and rate at end range
    dc1 = dup(j,1);
    dc2 = dup(j+1,1);
    dr1 = dup(j,2);
    dr2 = dup(j+1,2);
    % save start value for this range
    counter = counter + 1;
    dupp(counter,1) = dc1;
    dupp(counter,2) = dr1;
    % at increment for each value between
    for dc = dc1+inc:inc:dc2-inc
        % have dc, need rate
        dr = dr1 + (dr2-dr1)*(dc-dc1)/(dc2-dc1);
        % save interpolated value
        counter = counter + 1;
        dupp(counter,1) = dc;
        dupp(counter,2) = dr;
    end    
end
% save last value
counter = counter + 1;
dupp(counter,1) = dc2;
dupp(counter,2) = dr2;
[rh ch] = size(dupp)
plot(dupp(:,1),dupp(:,2),'r')

% process LOW branch
[r c] = size(ddn);
ddnp = [0 0];
counter = 0;
for j = 1:r-1
    % get conc and rate at end range
    dc1 = ddn(j,1);
    dc2 = ddn(j+1,1);
    dr1 = ddn(j,2);
    dr2 = ddn(j+1,2);
    % save start value for this range
    counter = counter + 1;
    ddnp(counter,1) = dc1;
    ddnp(counter,2) = dr1;
    % at increment for each value between
    for dc = dc1+inc:inc:dc2-inc
        % have dc, need rate
        dr = dr1 + (dr2-dr1)*(dc-dc1)/(dc2-dc1);
        % save interpolated value
        counter = counter + 1;
        ddnp(counter,1) = dc;
        ddnp(counter,2) = dr;
    end    
end
% save last value
counter = counter + 1;
ddnp(counter,1) = dc2;
ddnp(counter,2) = dr2;
[rl cl] = size(ddnp)
plot(ddnp(:,1),ddnp(:,2),'r')
ylabel('Rate')
xlabel('Reactant Concentration')
hold off

% SAVE RATES TO FILES
% as row vector, comma delimited for Javascript
rUp = dupp(:,2)';
rDown = ddnp(:,2)';
% dmlwrite default delimiter (dlm) is comma
dlmwrite('rateHIGH.txt',rUp)
dlmwrite('rateLOW.txt',rDown)


