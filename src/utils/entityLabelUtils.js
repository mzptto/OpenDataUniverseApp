export class EntityLabelUtils {
  static spacify(s) {
    return s ? s.replace(/(?<!^)(?=[A-Z])/g, ' ').trim() : '';
  }

  static kebabCase(s) {
    return this.spacify(s).toLowerCase().split(/\s+/).join('-');
  }

  static extractVersionFromPuml(puml, entityName) {
    try {
      if (!puml) return '';
      const semverRe = /([0-9]+\.[0-9]+\.[0-9]+)/g;
      // Look for kind-like tokens that include the entity name and a semver at the end
      const lines = puml.split('\n');
      for (const line of lines) {
        if (entityName && line.includes(entityName)) {
          const m = [...line.matchAll(semverRe)];
          if (m && m.length > 0) {
            return m[m.length - 1][1];
          }
        }
      }
      // Fallback: first semver anywhere
      const any = semverRe.exec(puml);
      return any ? any[1] : '';
    } catch (_) {
      return '';
    }
  }

  static deriveEntityLabel({ entityName, entityVersion, entityNameVersion, kind, pumlContent }) {
    // 1) Explicit name + version
    if (entityName && entityVersion) {
      const title = this.spacify(entityName);
      const sub = `${this.kebabCase(entityName)} - v ${entityVersion}`;
      return { title, sub };
    }
    // 2) Combined form: Name.1.0.1
    const env = entityNameVersion || entityName;
    if (typeof env === 'string') {
      const parts = env.split('.');
      if (parts.length >= 4) {
        const version = parts.slice(-3).join('.');
        const name = parts.slice(0, -3).join('.');
        return { title: this.spacify(name), sub: `${this.kebabCase(name)} - v ${version}` };
      }
    }
    // 3) Kind: osdu:wks:group--Entity:1.0.1
    if (typeof kind === 'string' && kind.split(':').length === 4) {
      const [, , groupEntity, version] = kind.split(':');
      const entity = (groupEntity || '').split('--').pop() || groupEntity;
      return { title: this.spacify(entity), sub: `${this.kebabCase(entity)} - v ${version}` };
    }
    // 4) Try to extract from PUML
    const maybeVersion = this.extractVersionFromPuml(pumlContent || '', entityName || '');
    if (entityName && maybeVersion) {
      const title = this.spacify(entityName);
      return { title, sub: `${this.kebabCase(entityName)} - v ${maybeVersion}` };
    }
    // Fallback
    const title = this.spacify(entityName || '');
    const sub = title ? this.kebabCase(title) : '';
    return { title, sub };
  }
}