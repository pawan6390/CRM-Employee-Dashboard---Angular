import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private toHttpParams(params?: Record<string, unknown>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value !== null && value !== undefined && value !== "") {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }

  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, {
      params: this.toHttpParams(params),
    });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }
}
