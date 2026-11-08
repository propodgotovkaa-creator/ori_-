"""Original procedural score and effects for Guardian of the Magic Forest.

Run with Python 3 and numpy. No samples, recordings, or external music used.
The 48-second score uses wrapped synthesis tails and periodic ambience so that
the WAV loop has no artificial start/end fade or click.
"""
from pathlib import Path
import wave
import numpy as np

RATE = 24000
OUT = Path(__file__).resolve().parents[1] / "assets" / "audio"
OUT.mkdir(parents=True, exist_ok=True)
RNG = np.random.default_rng(49217)


def frequency(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def tone(midi, duration, kind="piano"):
    t = np.arange(round(duration * RATE)) / RATE
    f = frequency(midi)
    if kind == "piano":
        y = (np.sin(2*np.pi*f*t) + .25*np.sin(2*np.pi*2*f*t) +
             .07*np.sin(2*np.pi*3*f*t))
        env = (1-np.exp(-t/0.008))*np.exp(-t/1.15)
    elif kind == "bell":
        y = (np.sin(2*np.pi*f*t) + .18*np.sin(2*np.pi*f*2.001*t) +
             .08*np.sin(2*np.pi*f*3.997*t))
        env = (1-np.exp(-t/.006))*np.exp(-t/1.6)
    else:
        y = sum(np.sin(2*np.pi*(f+detune)*t+phase)
                for detune, phase in [(-.22, 0), (.18, .4), (0, .8)]) / 3
        y += .08*np.sin(2*np.pi*2*f*t)
        env = np.sin(np.pi*np.minimum(t/duration, 1))**2
    # Always terminate very gently, including short effects.
    env *= np.minimum(1, np.maximum(0, (duration-t)/.12))
    return y*env


def add(target, signal, seconds, gain=1, pan=0, wrap=False):
    start = round(seconds*RATE)
    index = np.arange(len(signal)) + start
    if wrap:
        index %= len(target)
    else:
        valid = (index >= 0) & (index < len(target))
        index, signal = index[valid], signal[valid]
    left = np.sqrt((1-pan)/2)
    right = np.sqrt((1+pan)/2)
    np.add.at(target[:, 0], index, signal*gain*left)
    np.add.at(target[:, 1], index, signal*gain*right)


def save(name, data, peak=.5):
    maximum = np.max(np.abs(data))
    if maximum > 0:
        data = data / maximum * peak
    pcm = (np.clip(data, -1, 1)*32767).astype("<i2")
    with wave.open(str(OUT/name), "wb") as wav:
        wav.setnchannels(2 if data.ndim == 2 else 1)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(pcm.tobytes())


def music():
    duration = 48
    mix = np.zeros((RATE*duration, 2))
    chords = [[48,55,60,64], [45,52,57,60], [41,48,53,57], [43,50,55,62],
              [48,55,59,64], [45,52,60,64], [41,48,57,60], [43,50,55,60]]
    for bar, chord in enumerate(chords):
        # Pads overlap and wrap, supporting a continuous quiet score.
        for voice, note in enumerate(chord):
            add(mix, tone(note, 10, "pad"), bar*6-2, .038,
                (voice-1.5)*.23, True)
        pattern = [chord[0]+12, chord[2]+12, chord[1]+12, chord[3]+12]
        for beat, note in enumerate(pattern):
            add(mix, tone(note, 5), bar*6+beat*1.5, .095,
                (-1)**beat*.32, True)
    melody = [76, 79, 74, 72, 69, 72, 74, 79, 76, 71, 72, 76,
              69, 72, 74, 67]
    for i, note in enumerate(melody):
        add(mix, tone(note, 5, "bell"), i*3+.7, .035,
            np.sin(i*1.9)*.55, True)
    # Quiet seamless, band-limited air: periodic Fourier synthesis.
    t = np.arange(len(mix))/RATE
    air = np.zeros(len(mix))
    for _ in range(50):
        cycles = RNG.integers(1800, 16000)
        air += np.sin(2*np.pi*cycles*t/duration + RNG.uniform(0, 2*np.pi))
    air /= 50
    swell = .55+.2*np.sin(2*np.pi*t/duration)+.1*np.cos(6*np.pi*t/duration)
    mix[:, 0] += air*swell*.013
    mix[:, 1] += np.roll(air, 83)*swell*.013
    # Simple wrapped early reflections soften the dry synthesized instruments.
    mix += np.roll(mix, round(.19*RATE), axis=0)*.16
    mix += np.roll(mix[:, ::-1], round(.37*RATE), axis=0)*.10
    save("music.wav", mix, .38)


def noise_effect(name, duration, bass, decay, peak):
    t = np.arange(round(duration*RATE))/RATE
    noise = RNG.normal(0, 1, len(t))
    noise = np.convolve(noise, np.ones(21)/21, mode="same")
    env = np.minimum(t/.007, 1)*np.exp(-t/decay)*np.minimum(1,(duration-t)/.03)
    y = (.55*noise + .15*np.sin(2*np.pi*bass*t))*env
    save(name, y, peak)


def effects():
    noise_effect("step.wav", .13, 120, .033, .13)
    noise_effect("land.wav", .23, 85, .055, .20)
    t = np.arange(round(.38*RATE))/RATE
    f = 330 + 350*t/.38
    y = np.sin(2*np.pi*(330*t+350*t*t/(2*.38)))
    y *= np.sin(np.pi*t/.38)**2 * np.exp(-t*5)
    save("jump.wav", y, .18)
    for name, notes, spacing, duration, peak in [
        ("near.wav", [79], .1, 1.6, .12),
        ("collect.wav", [72,76,79,84], .10, 2.4, .32),
        ("card.wav", [76,79], .14, 2.0, .17),
        ("finale.wav", [60,67,72,76,79,84,88], .24, 5.0, .34),
    ]:
        mix = np.zeros((round(duration*RATE),2))
        for i, note in enumerate(notes):
            add(mix,tone(note,min(3,duration-i*spacing),"bell"),i*spacing,
                .6 if name == "finale.wav" else 1, (i%3-1)*.25)
        save(name,mix,peak)


if __name__ == "__main__":
    music()
    effects()
    for file in sorted(OUT.glob("*.wav")):
        with wave.open(str(file)) as wav:
            print(f"{file.name}: {wav.getnframes()/wav.getframerate():.2f}s, "
                  f"{file.stat().st_size:,} bytes, {wav.getnchannels()} channels")
