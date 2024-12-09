import { Injectable } from '@angular/core';
import Spotify from 'spotify-web-api-js';
import { INavOptions } from '../interfaces/INavOptions';
import { ISong, ISongItem } from '../interfaces/ISong';
import { AuthService } from '../auth/auth.service';
import { IUser } from '../interfaces/IUser';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  spotifyApi: Spotify.SpotifyWebApiJs = null;
  user: IUser;

  constructor(private authService: AuthService) {
    this.spotifyApi = new Spotify();
  }

  async getUserPlaylists(offset = 0, limit = 50): Promise<INavOptions[]> {
    const playlists = await this.spotifyApi.getUserPlaylists(this.user.id, {
      limit,
      offset,
    });

    return playlists.items
      .filter((playlist) => playlist?.id)
      .map((playlist) => {
        return {
          name: playlist.name,
          image: playlist.images[0].url,
          id: playlist.id,
        };
      });
  }

  async getTopArtists(limit = 10): Promise<SpotifyApi.ArtistObjectFull[]> {
    try {
      const topArtists = await this.spotifyApi.getMyTopArtists({
        limit,
      });

      return topArtists.items.map((artist) => artist);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getLikedSongs(offset = 0, limit: 50): Promise<ISong> {
    try {
      const songs = await this.spotifyApi.getMySavedTracks({ limit, offset });

      return {
        total: songs.total,
        items:
          songs.items.map((song) => {
            return {
              name: song.track.name,
              uri: song.track.uri,
              duration_ms: song.track.duration_ms,
              id: song.track.id,
              artists: song.track.artists,
              album: song.track.album,
            };
          }) || [],
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // TODO - Use Spotify's sdk to play song
  async playSong(songUri: string): Promise<void> {
    try {
      await this.spotifyApi.queue(songUri);
      await this.spotifyApi.skipToNext();
    } catch (error) {
      console.error(error);
    }
  }

  async getCurrentSong(): Promise<ISongItem> {
    try {
      const song = await this.spotifyApi.getMyCurrentPlayingTrack();

      return {
        name: song.item.name,
        uri: song.item.uri,
        duration_ms: song.item.duration_ms,
        id: song.item.id,
        album: {
          images: song.item.album.images,
          name: song.item.album.name,
          uri: song.item.album.uri,
        },
        artists: song.item.artists,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
