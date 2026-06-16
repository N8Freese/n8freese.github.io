clc;
clear;
close all;

%% ==================== TUNING KNOBS (APRIL 3 LAUNCH) ====================
v_mag = 10.84;
lead_angle_deg = 111.0;
v_plane_nudge = -0.03;

% Time setup
t0 = 0;
tf_days = 10.0;
tf = tf_days * 86400;

% Constants
muE   = 398600;          % Earth GM [km^3/s^2]
muM   = 4903;            % Moon GM [km^3/s^2]
muS   = 132712440018;    % Sun GM [km^3/s^2]
rE    = 6378;            % Earth radius [km]
rMoon = 384400;          % Mean Earth-Moon distance [km]
rMphys = 1737.4;         % Moon physical radius [km]
AU    = 149597870.7;     % Astronomical unit [km]

h = 150;                 % RK4 step size [s]
tspan = t0:h:tf;

use_sun_gravity = false; % true = include solar third-body gravity

%% ==================== MOON & SUN DATA ====================
moon_raw_data = [
16 55 16.21 -27 51 57.8
17 49 02.67 -28 23 50.9
18 43 12.39 -27 35 47.3
19 36 49.72 -25 28 11.8
20 29 13.11 -22 05 38.7
21 20 06.14 -17 36 19.9
22 09 39.65 -12 11 24.2
22 58 27.53 -06 04 34.8
23 47 20.41 +00 27 50.4
00 37 19.36 +07 06 44.6
01 29 28.73 +13 30 06.1
02 24 45.16 +19 13 19.9
];

sun_raw_data = [
23 23 26.90 -03 56 19.2
23 27 07.73 -03 32 45.8
23 30 48.28 -03 09 09.7
23 34 28.55 -02 45 31.3
23 38 08.58 -02 21 51.0
23 41 48.37 -01 58 09.3
23 45 27.94 -01 34 26.4
23 49 07.33 -01 10 42.8
23 52 46.53 -00 46 58.9
23 56 25.57 -00 23 15.1
00 00 04.46 +00 00 28.2
00 03 43.22 +00 24 10.6
];

% one ephemeris point per day
t_pts = (0:size(moon_raw_data,1)-1) * 86400;

%% ==================== PARSE MOON DATA ====================
RA_deg_M  = 15 * (moon_raw_data(:,1) + moon_raw_data(:,2)/60 + moon_raw_data(:,3)/3600);
DEC_deg_M = signed_dms_to_deg(moon_raw_data(:,4), moon_raw_data(:,5), moon_raw_data(:,6));

mx_pts = rMoon .* cosd(DEC_deg_M) .* cosd(RA_deg_M);
my_pts = rMoon .* cosd(DEC_deg_M) .* sind(RA_deg_M);
mz_pts = rMoon .* sind(DEC_deg_M);

%% ==================== PARSE SUN DATA ====================
RA_deg_S  = 15 * (sun_raw_data(:,1) + sun_raw_data(:,2)/60 + sun_raw_data(:,3)/3600);
DEC_deg_S = signed_dms_to_deg(sun_raw_data(:,4), sun_raw_data(:,5), sun_raw_data(:,6));

% Your table does not include Sun range, so assume 1 AU
rSun = AU * ones(size(sun_raw_data,1),1);

sx_pts = rSun .* cosd(DEC_deg_S) .* cosd(RA_deg_S);
sy_pts = rSun .* cosd(DEC_deg_S) .* sind(RA_deg_S);
sz_pts = rSun .* sind(DEC_deg_S);

%% ==================== INITIAL SPACECRAFT STATE ====================
% Moon position at t0
m0 = [interp1(t_pts, mx_pts, t0, 'pchip');
      interp1(t_pts, my_pts, t0, 'pchip');
      interp1(t_pts, mz_pts, t0, 'pchip')];

% Better Moon velocity estimate using central difference
dtVel = 43200;   % 12 hr
m_minus = [interp1(t_pts, mx_pts, t0 - dtVel, 'pchip', 'extrap');
           interp1(t_pts, my_pts, t0 - dtVel, 'pchip', 'extrap');
           interp1(t_pts, mz_pts, t0 - dtVel, 'pchip', 'extrap')];

m_plus = [interp1(t_pts, mx_pts, t0 + dtVel, 'pchip', 'extrap');
          interp1(t_pts, my_pts, t0 + dtVel, 'pchip', 'extrap');
          interp1(t_pts, mz_pts, t0 + dtVel, 'pchip', 'extrap')];

vMoon0 = (m_plus - m_minus) / (2*dtVel);

% Moon orbital plane basis
hhat = cross(m0, vMoon0);
hhat = hhat / norm(hhat);

rhat_moon = m0 / norm(m0);

% Rotate launch position within lunar orbital plane
rhat0 = rodrigues_rotate(rhat_moon, hhat, -deg2rad(lead_angle_deg));
rhat0 = rhat0 / norm(rhat0);

% Tangential direction in the same plane
that0 = cross(hhat, rhat0);
that0 = that0 / norm(that0);

% Keep same direction as Moon motion
if dot(that0, vMoon0) < 0
    that0 = -that0;
end

% Initial spacecraft state
r0_mag = rE + 300;
r0 = r0_mag * rhat0;

% Smaller out-of-plane tweak
v0 = v_mag * that0 + v_plane_nudge * hhat;

ySC = zeros(6, numel(tspan));
ySC(:,1) = [r0; v0];

%% ==================== RK4 SOLVER WITH IMPACT STOP ====================
hitEarth = false;
hitMoon  = false;
stopIdx  = numel(tspan);

for i = 1:numel(tspan)-1
    ti = tspan(i);
    yi = ySC(:,i);

    k1 = trajectory(ti,     yi,         t_pts, mx_pts, my_pts, mz_pts, sx_pts, sy_pts, sz_pts, muE, muM, muS, use_sun_gravity);
    k2 = trajectory(ti+h/2, yi+h*k1/2,  t_pts, mx_pts, my_pts, mz_pts, sx_pts, sy_pts, sz_pts, muE, muM, muS, use_sun_gravity);
    k3 = trajectory(ti+h/2, yi+h*k2/2,  t_pts, mx_pts, my_pts, mz_pts, sx_pts, sy_pts, sz_pts, muE, muM, muS, use_sun_gravity);
    k4 = trajectory(ti+h,   yi+h*k3,    t_pts, mx_pts, my_pts, mz_pts, sx_pts, sy_pts, sz_pts, muE, muM, muS, use_sun_gravity);

    y_next = yi + (h/6)*(k1 + 2*k2 + 2*k3 + k4);
    ySC(:,i+1) = y_next;

    % Earth impact check
    if norm(y_next(1:3)) <= rE
        hitEarth = true;
        stopIdx = i+1;
        break
    end

    % Moon impact check
    m_now = [interp1(t_pts, mx_pts, tspan(i+1), 'pchip');
             interp1(t_pts, my_pts, tspan(i+1), 'pchip');
             interp1(t_pts, mz_pts, tspan(i+1), 'pchip')];

    if norm(y_next(1:3) - m_now) <= rMphys
        hitMoon = true;
        stopIdx = i+1;
        break
    end
end

% Trim arrays so no post-impact junk gets plotted
ySC   = ySC(:,1:stopIdx);
tspan = tspan(1:stopIdx);

%% ==================== CLOSEST APPROACH TO MOON ====================
m_path = zeros(numel(tspan), 3);
dist = zeros(1, numel(tspan));

for k = 1:numel(tspan)
    m_now = [interp1(t_pts, mx_pts, tspan(k), 'pchip');
             interp1(t_pts, my_pts, tspan(k), 'pchip');
             interp1(t_pts, mz_pts, tspan(k), 'pchip')];

    m_path(k,:) = m_now.';
    dist(k) = norm(ySC(1:3,k) - m_now);
end

[min_dist, idx] = min(dist);

fprintf('Closest approach to Moon center  = %.2f km\n', min_dist);
fprintf('Closest approach to Moon surface = %.2f km\n', min_dist - rMphys);
fprintf('Time of closest approach         = %.3f days\n', tspan(idx)/86400);

if hitEarth
    fprintf('Integration stopped: spacecraft impacted Earth at t = %.3f days\n', tspan(end)/86400);
elseif hitMoon
    fprintf('Integration stopped: spacecraft impacted Moon at t = %.3f days\n', tspan(end)/86400);
else
    fprintf('Integration completed full time span.\n');
end

%% ==================== PLOTS ====================
[xe, ye, ze] = sphere(40);

% ---------------------------------------------------------
% FIGURE 1: EARTH-MOON VIEW
% ---------------------------------------------------------
figure('Color','w','Name','Earth-Moon View');
hold on;
grid on;
axis equal;
view(60,20);

surf(xe*rE, ye*rE, ze*rE, 'FaceAlpha', 0.12, 'MarkerFaceColor', 'g', 'FaceColor', 'g');

%plot3(mx_pts, my_pts, mz_pts, 'k:', 'LineWidth', 0.7);
plot3(m_path(:,1), m_path(:,2), m_path(:,3), 'b-', 'LineWidth', 1.5);
plot3(m_path(idx,1), m_path(idx,2), m_path(idx,3), 'bo', 'MarkerFaceColor', 'b', 'MarkerSize', 5);
plot3(ySC(1,:), ySC(2,:), ySC(3,:), 'r', 'LineWidth', 2.0);

title('Artemis II Flight Trajectory (Earth-Moon Path)');
xlabel('x [km]');
ylabel('y [km]');
zlabel('z [km]');

lim = 5e5;
xlim([-lim lim]);
ylim([-lim lim]);
zlim([-lim lim]);

legend('Earth','Moon Trajectory', ...
       'Moon', 'Spacecraft Trajectory', 'Location', 'best');

% ---------------------------------------------------------
% FIGURE 2: SOLAR SYSTEM SCALE VIEW
% ---------------------------------------------------------
figure('Color','w','Name','Solar System View');
hold on;
grid on;
axis equal;
view(60,20);

surf(xe*rE, ye*rE, ze*rE, 'FaceAlpha', 0.15, 'MarkerFaceColor', 'g', 'FaceColor', 'g');
plot3(m_path(:,1), m_path(:,2), m_path(:,3), 'b-', 'LineWidth', 1.5);
plot3(ySC(1,:), ySC(2,:), ySC(3,:), 'r', 'LineWidth', 2.0);
plot3(sx_pts(1), sy_pts(1), sz_pts(1), 'y.', 'MarkerSize', 55);
plot3([0 sx_pts(1)], [0 sy_pts(1)], [0 sz_pts(1)], 'y--', 'LineWidth', 1.5);

title('Artemis II Flight Trajectory (Sun Location)');
xlabel('x [km]');
ylabel('y [km]');
zlabel('z [km]');

legend('Earth', 'Moon Trajectory', 'Spacecraft Trajectory', 'Sun', ...
       'Line of Sight to Sun', 'Location', 'best');

%% ==================== DYNAMICS FUNCTION ====================
function dydt = trajectory(t, y, t_pts, mx, my, mz, sx, sy, sz, muE, muM, muS, use_sun)
    rv = y(1:3);
    vv = y(4:6);

    m_pos = [interp1(t_pts, mx, t, 'pchip');
             interp1(t_pts, my, t, 'pchip');
             interp1(t_pts, mz, t, 'pchip')];

    aE = -muE * rv / norm(rv)^3;
    aM =  muM * ((m_pos - rv)/norm(m_pos - rv)^3 - m_pos/norm(m_pos)^3);

    if use_sun
        s_pos = [interp1(t_pts, sx, t, 'pchip');
                 interp1(t_pts, sy, t, 'pchip');
                 interp1(t_pts, sz, t, 'pchip')];

        aS = muS * ((s_pos - rv)/norm(s_pos - rv)^3 - s_pos/norm(s_pos)^3);
    else
        aS = [0; 0; 0];
    end

    dydt = [vv; aE + aM + aS];
end

%% ==================== HELPER: SIGNED DEC PARSER ====================
function dec_deg = signed_dms_to_deg(d, m, s)
    sgn = ones(size(d));
    sgn(d < 0) = -1;
    dec_deg = sgn .* (abs(d) + m/60 + s/3600);
end

%% ==================== HELPER: RODRIGUES ROTATION ====================
function v_rot = rodrigues_rotate(v, k, theta)
    k = k / norm(k);
    v_rot = v*cos(theta) + cross(k, v)*sin(theta) + k*dot(k, v)*(1 - cos(theta));
end